'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Sparkles,
  FileCheck,
  Layers,
  Search,
  ExternalLink,
  X,
  FileCode,
} from 'lucide-react';
import { getDocuments, deleteDocumentRecord } from '@/app/actions/documents';
import { DocumentType } from '@/db/schema';

export default function DocumentsPage() {
  const [documentsList, setDocumentsList] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadType, setUploadType] = useState<DocumentType>('Resume');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadText, setUploadText] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  // Selected document text preview modal
  const [selectedDocText, setSelectedDocText] = useState<{ title: string; text: string } | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await getDocuments(filterType);
      setDocumentsList(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [filterType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setUploadFile(selected);
      if (!uploadTitle) {
        setUploadTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }

      // If text/markdown or plain text file, auto read text content
      if (selected.type.includes('text') || selected.name.endsWith('.txt') || selected.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadText(event.target?.result as string || '');
        };
        reader.readAsText(selected);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle || uploadFile.name);
      formData.append('type', uploadType);
      formData.append('textContent', uploadText);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadText('');
      fetchDocs();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document to Vercel Blob.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocumentRecord(id);
      fetchDocs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDocs = documentsList.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return doc.title.toLowerCase().includes(query) || doc.type.toLowerCase().includes(query);
  });

  const resumesCount = documentsList.filter((d) => d.type === 'Resume').length;
  const coverLettersCount = documentsList.filter((d) => d.type === 'Cover Letter').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                <FileCheck className="h-3.5 w-3.5" /> Powered by Vercel Blob Storage
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Resumes & Cover Letters
              </h1>
              <p className="mt-2 text-base text-slate-400 max-w-2xl">
                Store, manage, and tailor your job search documents. Your uploaded resumes are automatically integrated with your MCP AI Assistant.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 focus:outline-none"
              >
                <Upload className="h-4 w-4" /> Upload Document
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/80 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white">{documentsList.length}</div>
                <div className="text-xs text-slate-400">Total Uploaded Files</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white">{resumesCount}</div>
                <div className="text-xs text-slate-400">Resumes</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white">{coverLettersCount}</div>
                <div className="text-xs text-slate-400">Cover Letters</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {['All', 'Resume', 'Cover Letter', 'Portfolio', 'Other'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  filterType === tab
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {tab === 'All' ? 'All Documents' : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Documents Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-slate-500 text-sm">
              Loading documents from Vercel Storage...
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white leading-tight line-clamp-1">
                            {doc.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                doc.type === 'Resume'
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  : doc.type === 'Cover Letter'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {doc.type}
                            </span>
                            <span className="text-[11px] text-slate-400">{doc.fileSize || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-slate-400">
                      Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.downloadUrl || doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>

                      <button
                        onClick={() => handleCopyLink(doc.fileUrl, doc.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                        title="Copy Vercel Blob URL"
                      >
                        {copiedId === doc.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {doc.textContent && (
                        <button
                          onClick={() => setSelectedDocText({ title: doc.title, text: doc.textContent })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-indigo-400 hover:bg-slate-800 transition"
                          title="View Extracted Text"
                        >
                          <FileCode className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
                      title="Delete File"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">No documents found</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Upload your resumes or cover letters to store them for free on Vercel Blob storage.
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <Plus className="h-4 w-4" /> Upload Document
              </button>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="h-5 w-5 text-indigo-400" /> Upload Document to Vercel Blob
                </h3>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300">Select File (PDF, DOCX, TXT, MD)</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md"
                    onChange={handleFileChange}
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Roop Sai Surampudi - Senior Java Developer Resume"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">Document Category</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as DocumentType)}
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Resume">Resume</option>
                    <option value="Cover Letter">Cover Letter</option>
                    <option value="Portfolio">Portfolio</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Text Extract / Plain Text Content (Optional - for AI Cover Letter generation)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste resume text or summary here so your AI assistant can analyze it..."
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-indigo-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading to Vercel Blob...' : 'Upload File'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Text Preview Modal */}
        {selectedDocText && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-indigo-400" /> Extracted Text — {selectedDocText.title}
                </h3>
                <button
                  onClick={() => setSelectedDocText(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 max-h-96 overflow-y-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-indigo-300 border border-slate-800 whitespace-pre-wrap">
                {selectedDocText.text}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
