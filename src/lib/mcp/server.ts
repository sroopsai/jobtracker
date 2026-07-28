import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  mcpListApplications,
  mcpAddApplication,
  mcpUpdateApplication,
  mcpDeleteApplication,
  mcpGetAnalytics,
  mcpListDocuments,
  mcpGetDocumentContent,
  mcpDeleteDocument,
} from './service';

export function createJobTrackerMcpServer(userId: string) {
  const server = new McpServer({
    name: 'Job Tracker MCP Server',
    version: '1.0.0',
  });

  // Tool 1: list_job_applications
  server.tool(
    'list_job_applications',
    'List, search, or filter job applications in the Job Tracker database.',
    {
      search: z.string().optional().describe('Search query for company name, job title, location, or notes'),
      status: z
        .enum(['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'])
        .optional()
        .describe('Filter applications by status'),
    },
    async ({ search, status }) => {
      const apps = await mcpListApplications(userId, search, status);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(apps, null, 2),
          },
        ],
      };
    }
  );

  // Tool 2: add_job_application
  server.tool(
    'add_job_application',
    'Add a new job application to the Job Tracker.',
    {
      company: z.string().describe('Company name (e.g. Stripe, Google, Acme Corp)'),
      jobTitle: z.string().describe('Job title (e.g. Senior Frontend Engineer)'),
      status: z
        .enum(['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'])
        .optional()
        .default('Applied')
        .describe('Current status of the application'),
      applicationDate: z
        .string()
        .optional()
        .describe('Date applied in YYYY-MM-DD format. Defaults to today.'),
      jobUrl: z.string().optional().describe('URL to the job post'),
      location: z.string().optional().describe('Location (e.g. Remote, San Francisco, CA)'),
      salaryRange: z.string().optional().describe('Salary range (e.g. $150k - $180k)'),
      notes: z.string().optional().describe('Additional notes or details about the job'),
    },
    async (params) => {
      const created = await mcpAddApplication({
        userId,
        ...params,
      });
      return {
        content: [
          {
            type: 'text',
            text: `Successfully added job application for ${created.jobTitle} at ${created.company} (ID: ${created.id}).`,
          },
        ],
      };
    }
  );

  // Tool 3: update_job_application
  server.tool(
    'update_job_application',
    'Update an existing job application status, details, or notes.',
    {
      id: z.string().uuid().describe('The UUID of the job application to update'),
      company: z.string().optional(),
      jobTitle: z.string().optional(),
      status: z
        .enum(['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'])
        .optional()
        .describe('New status for the application'),
      applicationDate: z.string().optional(),
      jobUrl: z.string().optional(),
      location: z.string().optional(),
      salaryRange: z.string().optional(),
      notes: z.string().optional(),
    },
    async (params) => {
      const updated = await mcpUpdateApplication({
        userId,
        ...params,
      });
      if (!updated) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Application with ID ${params.id} was not found or you are not authorized to update it.`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: `Successfully updated application at ${updated.company} (${updated.jobTitle}) to status: ${updated.status}.`,
          },
        ],
      };
    }
  );

  // Tool 4: delete_job_application
  server.tool(
    'delete_job_application',
    'Delete a job application from the Job Tracker.',
    {
      id: z.string().uuid().describe('The UUID of the job application to delete'),
    },
    async ({ id }) => {
      const deleted = await mcpDeleteApplication(userId, id);
      if (!deleted) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Application with ID ${id} was not found or could not be deleted.`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: `Successfully deleted job application ${id}.`,
          },
        ],
      };
    }
  );

  // Tool 5: get_job_analytics
  server.tool(
    'get_job_analytics',
    'Get overall job search statistics, response rates, and application breakdown.',
    {},
    async () => {
      const stats = await mcpGetAnalytics(userId);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(stats, null, 2),
          },
        ],
      };
    }
  );

  // Tool 6: list_user_documents
  server.tool(
    'list_user_documents',
    'List all uploaded resumes, cover letters, and portfolio documents.',
    {
      type: z
        .enum(['Resume', 'Cover Letter', 'Portfolio', 'Other'])
        .optional()
        .describe('Filter by document type'),
    },
    async ({ type }) => {
      const docs = await mcpListDocuments(userId, type);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(docs, null, 2),
          },
        ],
      };
    }
  );

  // Tool 7: get_document_content
  server.tool(
    'get_document_content',
    'Get details and extracted text content of a specific uploaded resume or cover letter.',
    {
      documentId: z.string().uuid().describe('The UUID of the document'),
    },
    async ({ documentId }) => {
      const doc = await mcpGetDocumentContent(userId, documentId);
      if (!doc) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'Document not found or unauthorized.' }],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(doc, null, 2) }],
      };
    }
  );

  // Tool 8: delete_user_document
  server.tool(
    'delete_user_document',
    'Delete a resume or cover letter from storage and database.',
    {
      documentId: z.string().uuid().describe('The UUID of the document to delete'),
    },
    async ({ documentId }) => {
      const deleted = await mcpDeleteDocument(userId, documentId);
      return {
        content: [
          {
            type: 'text',
            text: deleted ? `Successfully deleted document ${documentId}.` : 'Failed to delete document.',
          },
        ],
      };
    }
  );

  // Resource 1: All Applications
  server.resource(
    'all_applications',
    'job-tracker://applications',
    async (uri) => {
      const apps = await mcpListApplications(userId);
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(apps, null, 2),
            mimeType: 'application/json',
          },
        ],
      };
    }
  );

  // Resource 2: All Documents
  server.resource(
    'all_documents',
    'job-tracker://documents',
    async (uri) => {
      const docs = await mcpListDocuments(userId);
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(docs, null, 2),
            mimeType: 'application/json',
          },
        ],
      };
    }
  );

  // Prompt 1: Tailor Cover Letter
  server.prompt(
    'tailor_cover_letter',
    {
      company: z.string().describe('Target company name'),
    },
    async ({ company }) => {
      const apps = await mcpListApplications(userId, company);
      const docs = await mcpListDocuments(userId, 'Resume');
      const app = apps[0];
      const resume = docs[0];

      const resumeText = resume?.textContent || 'Candidate Resume Text Not Extracted';
      const jobInfo = app
        ? `Company: ${app.company}\nTitle: ${app.jobTitle}\nNotes: ${app.notes || 'N/A'}`
        : `Company: ${company}`;

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please draft a highly tailored cover letter using my resume information and job details below:\n\nTarget Job Details:\n${jobInfo}\n\nMy Resume Content:\n${resumeText}\n\nPlease generate a compelling, modern 3-paragraph cover letter tailored specifically to this role.`,
            },
          },
        ],
      };
    }
  );

  return server;
}
