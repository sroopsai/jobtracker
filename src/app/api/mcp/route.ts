import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  mcpListApplications,
  mcpAddApplication,
  mcpUpdateApplication,
  mcpDeleteApplication,
  mcpGetAnalytics,
  mcpListDocuments,
  mcpGetDocumentContent,
  mcpDeleteDocument,
} from '@/lib/mcp/service';

import { resolveUserIdFromToken } from '@/app/actions/mcpTokens';

async function resolveUserId(req: NextRequest): Promise<string | null> {
  // 1. Try Clerk session auth first (for logged in browser users)
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch {}

  // 2. Check Authorization Bearer Token
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const tokenUserId = await resolveUserIdFromToken(token);
    if (tokenUserId) return tokenUserId;
  }

  // 3. Fallback to custom x-mcp-token header
  const mcpTokenHeader = req.headers.get('x-mcp-token');
  if (mcpTokenHeader) {
    const tokenUserId = await resolveUserIdFromToken(mcpTokenHeader);
    if (tokenUserId) return tokenUserId;
  }

  return null;
}

export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized. Please provide a valid session or Authorization header.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { method, params } = body;

    switch (method) {
      case 'tools/list':
        return NextResponse.json({
          tools: [
            {
              name: 'list_job_applications',
              description: 'List, search, or filter job applications.',
              inputSchema: {
                type: 'object',
                properties: {
                  search: { type: 'string' },
                  status: { type: 'string', enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'] },
                },
              },
            },
            {
              name: 'add_job_application',
              description: 'Add a new job application.',
              inputSchema: {
                type: 'object',
                required: ['company', 'jobTitle'],
                properties: {
                  company: { type: 'string' },
                  jobTitle: { type: 'string' },
                  status: { type: 'string', enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'] },
                  applicationDate: { type: 'string' },
                  jobUrl: { type: 'string' },
                  location: { type: 'string' },
                  salaryRange: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
            {
              name: 'update_job_application',
              description: 'Update an existing job application status or details.',
              inputSchema: {
                type: 'object',
                required: ['id'],
                properties: {
                  id: { type: 'string' },
                  company: { type: 'string' },
                  jobTitle: { type: 'string' },
                  status: { type: 'string', enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'] },
                  applicationDate: { type: 'string' },
                  jobUrl: { type: 'string' },
                  location: { type: 'string' },
                  salaryRange: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
            {
              name: 'delete_job_application',
              description: 'Delete a job application.',
              inputSchema: {
                type: 'object',
                required: ['id'],
                properties: {
                  id: { type: 'string' },
                },
              },
            },
            {
              name: 'get_job_analytics',
              description: 'Get job application statistics.',
              inputSchema: { type: 'object', properties: {} },
            },
            {
              name: 'list_user_documents',
              description: 'List uploaded resumes, cover letters, and portfolio files.',
              inputSchema: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['Resume', 'Cover Letter', 'Portfolio', 'Other'] },
                },
              },
            },
            {
              name: 'get_document_content',
              description: 'Fetch details and text content of a specific resume or cover letter.',
              inputSchema: {
                type: 'object',
                required: ['documentId'],
                properties: {
                  documentId: { type: 'string' },
                },
              },
            },
            {
              name: 'delete_user_document',
              description: 'Delete an uploaded resume or cover letter document.',
              inputSchema: {
                type: 'object',
                required: ['documentId'],
                properties: {
                  documentId: { type: 'string' },
                },
              },
            },
          ],
        });

      case 'tools/call': {
        const toolName = params?.name;
        const args = params?.arguments || {};

        if (toolName === 'list_job_applications') {
          const result = await mcpListApplications(userId, args.search, args.status);
          return NextResponse.json({ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
        }

        if (toolName === 'add_job_application') {
          const result = await mcpAddApplication({ userId, ...args });
          return NextResponse.json({
            content: [{ type: 'text', text: `Added application: ${result.jobTitle} at ${result.company}` }],
          });
        }

        if (toolName === 'update_job_application') {
          const result = await mcpUpdateApplication({ userId, ...args });
          if (!result) {
            return NextResponse.json(
              { isError: true, content: [{ type: 'text', text: 'Application not found or unauthorized.' }] },
              { status: 404 }
            );
          }
          return NextResponse.json({
            content: [{ type: 'text', text: `Updated ${result.company} application to ${result.status}` }],
          });
        }

        if (toolName === 'delete_job_application') {
          const ok = await mcpDeleteApplication(userId, args.id);
          return NextResponse.json({
            content: [{ type: 'text', text: ok ? `Deleted application ${args.id}` : 'Failed to delete.' }],
          });
        }

        if (toolName === 'get_job_analytics') {
          const result = await mcpGetAnalytics(userId);
          return NextResponse.json({ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
        }

        if (toolName === 'list_user_documents') {
          const result = await mcpListDocuments(userId, args.type);
          return NextResponse.json({ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
        }

        if (toolName === 'get_document_content') {
          const result = await mcpGetDocumentContent(userId, args.documentId);
          if (!result) {
            return NextResponse.json(
              { isError: true, content: [{ type: 'text', text: 'Document not found' }] },
              { status: 404 }
            );
          }
          return NextResponse.json({ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
        }

        if (toolName === 'delete_user_document') {
          const ok = await mcpDeleteDocument(userId, args.documentId);
          return NextResponse.json({
            content: [{ type: 'text', text: ok ? `Deleted document ${args.documentId}` : 'Failed to delete.' }],
          });
        }

        return NextResponse.json({ error: `Unknown tool: ${toolName}` }, { status: 400 });
      }

      default:
        return NextResponse.json({ error: `Unsupported method: ${method}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'online',
    server: 'Job Tracker MCP Server',
    version: '1.0.0',
    userId,
    endpoints: {
      jsonrpc: '/api/mcp',
    },
  });
}
