import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignInButton } from '@clerk/nextjs';
import { Briefcase, CheckCircle2, BarChart3, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center overflow-hidden bg-slate-950 px-4 py-16 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-4xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400">
          <ShieldCheck className="h-4 w-4" /> Secure & Serverless Job Search Tracker
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Track Every Job Application <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            From Applied to Offer
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
          Keep your job search organized. Log applications, manage interview rounds, track salaries, and view real-time pipeline analytics with Clerk authentication and Neon Postgres.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500">
              Get Started Now <ArrowRight className="h-5 w-5" />
            </button>
          </SignInButton>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="rounded-xl bg-indigo-950 p-2.5 text-indigo-400 w-fit">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Visual Analytics</h3>
            <p className="mt-1 text-xs text-slate-400">
              Interactive dashboard charts powered by Recharts for quick pipeline metrics.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="rounded-xl bg-purple-950 p-2.5 text-purple-400 w-fit">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">User Data Isolation</h3>
            <p className="mt-1 text-xs text-slate-400">
              Strict Clerk server-authenticated queries ensuring your records remain 100% private.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="rounded-xl bg-emerald-950 p-2.5 text-emerald-400 w-fit">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Full Application Lifecycle</h3>
            <p className="mt-1 text-xs text-slate-400">
              Filter by status, search companies, edit dates, add interview notes, and log salary ranges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
