import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  mcpListApplications,
  mcpAddApplication,
  mcpUpdateApplication,
  mcpDeleteApplication,
  mcpGetAnalytics,
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

  // Resource 2: Application Analytics
  server.resource(
    'analytics',
    'job-tracker://analytics',
    async (uri) => {
      const stats = await mcpGetAnalytics(userId);
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(stats, null, 2),
            mimeType: 'application/json',
          },
        ],
      };
    }
  );

  // Prompt 1: Interview Prep Strategy
  server.prompt(
    'interview_prep',
    {
      company: z.string().describe('Company name to prepare interview for'),
    },
    async ({ company }) => {
      const apps = await mcpListApplications(userId, company);
      const app = apps[0];
      const jobDetails = app
        ? `Company: ${app.company}\nTitle: ${app.jobTitle}\nLocation: ${app.location || 'N/A'}\nNotes: ${app.notes || 'None'}`
        : `Company: ${company}`;

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Help me prepare for an upcoming interview. Here are my application details:\n\n${jobDetails}\n\nPlease generate:\n1. 5 technical & behavioral questions likely asked for this role.\n2. 3 insightful questions I should ask the interviewer.\n3. A summary of key points to emphasize based on my notes.`,
            },
          },
        ],
      };
    }
  );

  return server;
}
