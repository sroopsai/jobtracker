export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-32 rounded-2xl bg-slate-900/80 border border-slate-800" />
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800" />
        ))}
      </div>
      <div className="mt-8 h-80 rounded-2xl bg-slate-900/60 border border-slate-800" />
    </div>
  );
}
