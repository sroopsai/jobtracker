export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-32 rounded-2xl bg-slate-900/80 border border-slate-800" />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800" />
        ))}
      </div>
    </div>
  );
}
