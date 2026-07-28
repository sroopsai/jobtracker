import { ApplicationStatus } from '@/db/schema';

export function StatusBadge({ status }: { status: ApplicationStatus | string }) {
  const styles: Record<string, string> = {
    Saved: 'bg-slate-800 text-slate-300 border-slate-700',
    Applied: 'bg-blue-950/80 text-blue-400 border-blue-800/50',
    Interview: 'bg-purple-950/80 text-purple-400 border-purple-800/50',
    Offer: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50',
    Rejected: 'bg-red-950/80 text-red-400 border-red-800/50',
  };

  const currentStyle = styles[status] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${currentStyle}`}
    >
      {status}
    </span>
  );
}
