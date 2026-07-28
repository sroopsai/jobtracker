'use client';

import { useState } from 'react';
import { JobApplication } from '@/db/schema';
import { StatusBadge } from '@/components/StatusBadge';
import {
  X,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  Globe,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  app: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (app: JobApplication) => void;
}

export function ApplicationDetailModal({
  app,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ApplicationDetailModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !app) return null;

  const handleCopyLink = () => {
    if (app.jobUrl) {
      navigator.clipboard.writeText(app.jobUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
        {/* Top Header & Close */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                <Building2 className="h-3.5 w-3.5" />
                {app.company}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 border border-slate-700">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                {app.source || 'LinkedIn'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight pt-1">
              {app.jobTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={app.status} />
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Calendar className="h-4 w-4 text-indigo-400" /> Application Date
            </div>
            <div className="mt-1.5 text-sm font-bold text-white">{app.applicationDate}</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <MapPin className="h-4 w-4 text-purple-400" /> Location
            </div>
            <div className="mt-1.5 text-sm font-bold text-white">
              {app.location || 'Not Specified'}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <DollarSign className="h-4 w-4 text-emerald-400" /> Salary Range
            </div>
            <div className="mt-1.5 text-sm font-bold text-white">
              {app.salaryRange || 'Not Specified'}
            </div>
          </div>
        </div>

        {/* Job URL Box */}
        {app.jobUrl && (
          <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <ExternalLink className="h-4 w-4" /> Official Job Posting Link
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedLink ? 'Copied Link' : 'Copy URL'}
                </button>
                <a
                  href={app.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition"
                >
                  Open Posting <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <p className="mt-2 text-xs text-indigo-200/80 font-mono truncate">{app.jobUrl}</p>
          </div>
        )}

        {/* Notes & Description Section */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" /> Job Notes & Description
          </h3>
          <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
            {app.notes || 'No extra notes provided for this job application.'}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-5 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              Updated {new Date(app.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(app);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Edit2 className="h-3.5 w-3.5 text-indigo-400" /> Edit
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(app);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-900/50 bg-rose-950/30 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/60 transition"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
