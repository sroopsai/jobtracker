'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  Cpu,
  Terminal,
  Server,
  Play,
  Copy,
  Check,
  Zap,
  Code2,
  Sparkles,
  BookOpen,
  Key,
  ShieldCheck,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';
import { callMcpTool, listMcpTools } from '@/lib/mcp/client';
import { getUserMcpKeys, createMcpToken, revokeMcpToken } from '@/app/actions/mcpTokens';

export default function McpHubPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'playground' | 'docs'>('config');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Access Tokens State
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [tokenName, setTokenName] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);

  // Playground state
  const [tools, setTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('get_job_analytics');
  const [toolArgs, setToolArgs] = useState<string>('{}');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'error'>('checking');

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/mcp');
        if (res.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('error');
        }

        const toolRes = await listMcpTools();
        if (toolRes.tools) {
          setTools(toolRes.tools);
        }

        // Fetch user MCP tokens
        const keys = await getUserMcpKeys();
        setUserTokens(keys || []);
      } catch (err) {
        setServerStatus('error');
      }
    }
    init();
  }, []);

  const handleCreateToken = async () => {
    setIsGenerating(true);
    try {
      const newToken = await createMcpToken(tokenName || 'MCP Access Token');
      setNewlyCreatedToken(newToken.key);
      setTokenName('');
      const updatedKeys = await getUserMcpKeys();
      setUserTokens(updatedKeys || []);
    } catch (err: any) {
      alert(err.message || 'Failed to generate token. Please make sure you are signed in.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeToken = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this MCP Access Token?')) return;
    try {
      await revokeMcpToken(id);
      const updatedKeys = await getUserMcpKeys();
      setUserTokens(updatedKeys || []);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke token');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExecuteTool = async () => {
    setLoading(true);
    setExecutionResult(null);
    try {
      let parsedArgs = {};
      if (toolArgs.trim()) {
        parsedArgs = JSON.parse(toolArgs);
      }
      const res = await callMcpTool({ tool: selectedTool, args: parsedArgs });
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({ error: err.message || 'Failed to execute MCP tool' });
    } finally {
      setLoading(false);
    }
  };

  const activeToken = userTokens[0]?.key || newlyCreatedToken || 'YOUR_MCP_ACCESS_TOKEN';

  const desktopConfig = JSON.stringify(
    {
      mcpServers: {
        'job-tracker': {
          url: 'http://localhost:3000/api/mcp',
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        },
      },
    },
    null,
    2
  );

  const httpConfig = `// Remote JSON-RPC Request over HTTP
POST /api/mcp
Headers:
  Content-Type: application/json
  Authorization: Bearer ${activeToken}

Body:
{
  "method": "tools/call",
  "params": {
    "name": "add_job_application",
    "arguments": {
      "company": "Stripe",
      "jobTitle": "Staff Software Engineer",
      "status": "Applied",
      "salaryRange": "$220k - $260k",
      "location": "San Francisco, CA"
    }
  }
}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" /> Zero DB Secrets Exposed • Browser & Token Auth
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                MCP Server & Access Manager
              </h1>
              <p className="mt-2 text-base text-slate-400 max-w-2xl">
                Connect your Job Tracker securely to AI Clients (Claude Desktop, Antigravity CLI, Cursor) using OAuth / Bearer Access Tokens. The server handles all database queries internally.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                      serverStatus === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-3 w-3 rounded-full ${
                      serverStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {serverStatus === 'online' ? 'MCP API Endpoint Ready' : 'Checking API Endpoint...'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex border-b border-slate-800 gap-6">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${
                activeTab === 'config'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="h-4 w-4" /> Access Tokens & Config
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${
                activeTab === 'playground'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="h-4 w-4" /> MCP Client Playground
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${
                activeTab === 'docs'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-4 w-4" /> Capabilities & API Specs
            </button>
          </div>
        </div>

        {/* Tab 1: Token Management & Integration */}
        {activeTab === 'config' && (
          <div className="mt-8 space-y-8">
            {/* Section 1: Generate & Manage MCP Access Tokens */}
            <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/80 p-6 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Key className="h-5 w-5 text-indigo-400" /> Your MCP Access Tokens
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Generate secure personal tokens to authenticate your AI Client without sharing database credentials or passwords.
                  </p>
                </div>
              </div>

              {/* Create Token Form */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Token Name (e.g. Claude Desktop, Cursor AI)"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleCreateToken}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition"
                >
                  <Plus className="h-4 w-4" />
                  {isGenerating ? 'Generating Token...' : 'Generate New Token'}
                </button>
              </div>

              {/* Display newly created token alert */}
              {newlyCreatedToken && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Lock className="h-4 w-4" /> Token Created Successfully!
                    </span>
                    <button
                      onClick={() => handleCopy(newlyCreatedToken, 'token_new')}
                      className="rounded bg-emerald-800/60 px-2.5 py-1 text-emerald-200 hover:bg-emerald-700 transition"
                    >
                      {copiedSection === 'token_new' ? 'Copied Token!' : 'Copy Token'}
                    </button>
                  </div>
                  <pre className="mt-2 font-mono text-emerald-400 overflow-x-auto bg-slate-950 p-2.5 rounded border border-emerald-900">
                    {newlyCreatedToken}
                  </pre>
                </div>
              )}

              {/* Active Tokens Table */}
              <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                {userTokens.length > 0 ? (
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Token Preview</th>
                        <th className="px-4 py-3 font-semibold">Created</th>
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {userTokens.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-900/30">
                          <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                          <td className="px-4 py-3 font-mono text-slate-400">
                            {t.key.substring(0, 14)}...{t.key.substring(t.key.length - 4)}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleCopy(t.key, `token_${t.id}`)}
                                className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                                title="Copy Token"
                              >
                                {copiedSection === `token_${t.id}` ? (
                                  <Check className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRevokeToken(t.id)}
                                className="rounded p-1.5 text-rose-400 hover:bg-rose-950/40 transition"
                                title="Revoke Token"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active MCP Access Tokens found. Click &quot;Generate New Token&quot; above to create one.
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Client Configs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: Desktop Client Config */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Desktop Client Config</h3>
                      <p className="text-xs text-slate-400">Claude Desktop, Antigravity CLI, Cursor</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(desktopConfig, 'desktop')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
                  >
                    {copiedSection === 'desktop' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedSection === 'desktop' ? 'Copied' : 'Copy Config'}
                  </button>
                </div>
                <p className="mt-4 text-xs text-slate-300">
                  Add this block to your MCP client config file. Notice zero database connection strings are exposed:
                </p>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs font-mono text-indigo-300 border border-slate-800">
                  {desktopConfig}
                </pre>
              </div>

              {/* Option B: HTTP / JSON-RPC */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">HTTP Bearer Authorization</h3>
                      <p className="text-xs text-slate-400">Web Agents, Webhooks, Remote Clients</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(httpConfig, 'http')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
                  >
                    {copiedSection === 'http' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedSection === 'http' ? 'Copied' : 'Copy Request'}
                  </button>
                </div>
                <p className="mt-4 text-xs text-slate-300">
                  Send JSON-RPC tool requests over HTTP POST with your Bearer Access Token:
                </p>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs font-mono text-cyan-300 border border-slate-800">
                  {httpConfig}
                </pre>
              </div>
            </div>

            {/* Example Prompt Workflows */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" /> What You Can Ask Your AI Assistant:
              </h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Log Application</div>
                  <p className="mt-2 text-sm text-slate-200">
                    &quot;I just applied for Senior Frontend Engineer at Vercel in NYC paying $190k-$220k. Add it to my job tracker.&quot;
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Check Interviews</div>
                  <p className="mt-2 text-sm text-slate-200">
                    &quot;Show me all companies where my application status is currently set to &apos;Interview&apos;.&quot;
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Prepare Strategy</div>
                  <p className="mt-2 text-sm text-slate-200">
                    &quot;Generate interview preparation questions for my upcoming interview at Stripe based on my job notes.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: MCP Client Playground */}
        {activeTab === 'playground' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-400" /> Test Tool Invocation
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Directly invoke your Job Tracker MCP Server tools from this client interface.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300">Select MCP Tool</label>
                  <select
                    value={selectedTool}
                    onChange={(e) => {
                      setSelectedTool(e.target.value);
                      if (e.target.value === 'add_job_application') {
                        setToolArgs(
                          JSON.stringify(
                            {
                              company: 'Linear',
                              jobTitle: 'Product Designer',
                              status: 'Applied',
                              location: 'Remote',
                              salaryRange: '$170k - $210k',
                            },
                            null,
                            2
                          )
                        );
                      } else if (e.target.value === 'list_job_applications') {
                        setToolArgs(JSON.stringify({ status: 'Applied' }, null, 2));
                      } else {
                        setToolArgs('{}');
                      }
                    }}
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="get_job_analytics">get_job_analytics</option>
                    <option value="list_job_applications">list_job_applications</option>
                    <option value="add_job_application">add_job_application</option>
                    <option value="update_job_application">update_job_application</option>
                    <option value="delete_job_application">delete_job_application</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">Arguments (JSON)</label>
                  <textarea
                    rows={6}
                    value={toolArgs}
                    onChange={(e) => setToolArgs(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-indigo-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleExecuteTool}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition"
                >
                  <Play className="h-4 w-4" />
                  {loading ? 'Executing Tool...' : 'Execute Tool'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="h-5 w-5 text-cyan-400" /> Response Output
              </h3>
              <p className="mt-1 text-xs text-slate-400">JSON-RPC payload returned by the MCP Server.</p>

              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 h-[340px] overflow-y-auto font-mono text-xs">
                {executionResult ? (
                  <pre className="text-emerald-400">{JSON.stringify(executionResult, null, 2)}</pre>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    Click &quot;Execute Tool&quot; to run an MCP tool call.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tools & API Specs */}
        {activeTab === 'docs' && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-bold text-white">Exposed MCP Tools & Schemas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tools.map((t) => (
                <div key={t.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-bold font-mono text-indigo-400 border border-indigo-500/20">
                      {t.name}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{t.description}</p>
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Input Schema</span>
                    <pre className="mt-1.5 overflow-x-auto rounded-xl bg-slate-950 p-3 text-[11px] font-mono text-slate-300 border border-slate-800">
                      {JSON.stringify(t.inputSchema, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
