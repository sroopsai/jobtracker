export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-28 rounded-2xl bg-slate-900/80 border border-slate-800" />
      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="h-10 w-64 rounded-xl bg-slate-900/60 border border-slate-800" />
        <div className="h-10 w-32 rounded-xl bg-slate-900/60 border border-slate-800" />
      </div>
      <div className="mt-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-900/60 border border-slate-800" />
        ))}
      </div>
    </div>
  );
}
