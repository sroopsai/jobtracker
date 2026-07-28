export interface McpToolCallRequest {
  tool: string;
  args?: Record<string, any>;
  userId?: string;
}

/**
 * Client helper to call MCP tools via HTTP JSON-RPC endpoint.
 */
export async function callMcpTool(request: McpToolCallRequest) {
  const response = await fetch('/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(request.userId && { 'x-user-id': request.userId }),
    },
    body: JSON.stringify({
      method: 'tools/call',
      params: {
        name: request.tool,
        arguments: request.args || {},
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to call MCP tool');
  }

  return await response.json();
}

/**
 * Client helper to list available MCP tools from the server.
 */
export async function listMcpTools() {
  const response = await fetch('/api/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: 'tools/list' }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to fetch MCP tools');
  }

  return await response.json();
}
