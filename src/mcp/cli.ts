import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createJobTrackerMcpServer } from '@/lib/mcp/server';

const userId = process.env.MCP_USER_ID || process.env.DEFAULT_USER_ID || 'default_user';

async function main() {
  const server = createJobTrackerMcpServer(userId);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Job Tracker MCP Server running on stdio for user ID: ${userId}`);
}

main().catch((err) => {
  console.error('Fatal error running Job Tracker MCP Server:', err);
  process.exit(1);
});
