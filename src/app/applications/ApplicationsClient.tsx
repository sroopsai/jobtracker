'use client';

import { useState } from 'react';
import { JobApplication, applicationStatuses } from '@/db/schema';
import { ApplicationInput, createApplication, updateApplication, deleteApplication } from '@/app/actions/applications';
import { StatusBadge } from '@/components/StatusBadge';
import { ApplicationFormModal } from '@/components/ApplicationFormModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Plus, Search, Filter, Calendar, MapPin, DollarSign, ExternalLink, Edit2, Trash2, FileText, Briefcase } from 'lucide-react';

interface ApplicationsClientProps {
  initialApplications: JobApplication[];
}

export function ApplicationsClient({ initialApplications }: ApplicationsClientProps) {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<JobApplication | null>(null);

  // Client-side filtering for fast interactive feedback
  const filteredApps = initialApplications.filter((app) => {
    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      app.company.toLowerCase().includes(term) ||
      app.jobTitle.toLowerCase().includes(term) ||
      (app.location && app.location.toLowerCase().includes(term)) ||
      (app.notes && app.notes.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  const handleCreate = async (data: ApplicationInput) => {
    await createApplication(data);
  };

  const handleUpdate = async (data: ApplicationInput) => {
    if (!editingApp) return;
    await updateApplication(editingApp.id, data);
  };

  const handleDelete = async () => {
    if (!deletingApp) return;
    await deleteApplication(deletingApp.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Applications</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage and track all your job applications in one place.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          Add Application
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by company, job title, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Statuses ({initialApplications.length})</option>
            {applicationStatuses.map((st) => (
              <option key={st} value={st}>
                {st} ({initialApplications.filter((a) => a.status === st).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Grid / Cards */}
      {filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">No applications found</h3>
          <p className="mt-1 text-xs text-slate-400">
            {search || selectedStatus !== 'All'
              ? 'Try adjusting your search terms or filters.'
              : 'Add your first job application to start tracking!'}
          </p>
          {!(search || selectedStatus !== 'All') && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition"
            >
              <Plus className="h-4 w-4" /> Add Application
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition hover:border-slate-700"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{app.jobTitle}</h3>
                    <p className="text-sm font-semibold text-indigo-400">{app.company}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Applied: {app.applicationDate}</span>
                  </div>

                  {app.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{app.location}</span>
                    </div>
                  )}

                  {app.salaryRange && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{app.salaryRange}</span>
                    </div>
                  )}

                  {app.jobUrl && (
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline"
                      >
                        Job Posting
                      </a>
                    </div>
                  )}
                </div>

                {app.notes && (
                  <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-slate-400">
                      <FileText className="h-3.5 w-3.5" /> Notes:
                    </div>
                    <p className="whitespace-pre-wrap">{app.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-500">
                <span>
                  Updated {new Date(app.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingApp(app)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-indigo-400" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingApp(app)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-950/40 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <ApplicationFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreate}
        title="Add Job Application"
      />

      {/* Edit Modal */}
      <ApplicationFormModal
        isOpen={!!editingApp}
        onClose={() => setEditingApp(null)}
        onSubmit={handleUpdate}
        initialData={editingApp}
        title="Edit Job Application"
      />

      {/* Delete Confirmation Modal */}
      {deletingApp && (
        <DeleteConfirmModal
          isOpen={!!deletingApp}
          onClose={() => setDeletingApp(null)}
          onConfirm={handleDelete}
          companyName={deletingApp.company}
          jobTitle={deletingApp.jobTitle}
        />
      )}
    </div>
  );
}
