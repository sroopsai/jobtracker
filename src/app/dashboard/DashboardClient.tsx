'use client';

import { useState } from 'react';
import { JobApplication } from '@/db/schema';
import { ApplicationInput, createApplication, updateApplication, deleteApplication } from '@/app/actions/applications';
import { StatusChart } from '@/components/StatusChart';
import { StatusBadge } from '@/components/StatusBadge';
import { ApplicationFormModal } from '@/components/ApplicationFormModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import Link from 'next/link';
import { Plus, Briefcase, Calendar, MapPin, ExternalLink, ArrowRight, CheckCircle2, XCircle, Users, Award, Clock } from 'lucide-react';

interface DashboardClientProps {
  stats: {
    total: number;
    saved: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
    chartData: { name: string; count: number; fill: string }[];
  };
  recentApps: JobApplication[];
}

export function DashboardClient({ stats, recentApps }: DashboardClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<JobApplication | null>(null);

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

  const cards = [
    {
      title: 'Total Applications',
      value: stats.total,
      icon: Briefcase,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-950/40 border-indigo-800/40',
    },
    {
      title: 'Interviews',
      value: stats.interview,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/40 border-purple-800/40',
    },
    {
      title: 'Offers Received',
      value: stats.offer,
      icon: Award,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-800/40',
    },
    {
      title: 'Rejections',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-950/40 border-red-800/40',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Overview of your job search progress and recent application activity.
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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`rounded-2xl border p-5 transition hover:border-slate-700 ${card.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`rounded-xl p-2 bg-slate-900/60 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-white">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics & Chart Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recharts Status Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-lg font-bold text-white">Application Status Breakdown</h2>
              <p className="text-xs text-slate-400">Applications grouped by current recruitment status</p>
            </div>
          </div>
          <div className="mt-6">
            <StatusChart data={stats.chartData} />
          </div>
        </div>

        {/* Saved & Applied Quick Summary */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div>
            <h2 className="text-lg font-bold text-white">Application Funnel</h2>
            <p className="text-xs text-slate-400 mt-0.5">Pipeline snapshot</p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-slate-800 text-slate-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Saved Drafts</p>
                    <p className="text-sm font-bold text-white">{stats.saved}</p>
                  </div>
                </div>
                <StatusBadge status="Saved" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-blue-950 text-blue-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Applied</p>
                    <p className="text-sm font-bold text-white">{stats.applied}</p>
                  </div>
                </div>
                <StatusBadge status="Applied" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <Link
              href="/applications"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              View all applications <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Applications List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Applications</h2>
            <p className="text-xs text-slate-400">Your latest submitted job applications</p>
          </div>
          <Link
            href="/applications"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">No applications added yet</h3>
            <p className="mt-1 text-xs text-slate-400">Get started by creating your first job application.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add Application
            </button>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-800/60">
            {recentApps.map((app) => (
              <div key={app.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{app.jobTitle}</h3>
                    <span className="text-slate-500">•</span>
                    <span className="text-sm text-slate-300 font-medium">{app.company}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      Applied: {app.applicationDate}
                    </span>
                    {app.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        {app.location}
                      </span>
                    )}
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-indigo-400 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Job Link
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingApp(app)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingApp(app)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
