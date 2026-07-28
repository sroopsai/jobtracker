import { auth } from '@clerk/nextjs/server';
import { getApplicationStats, getApplications } from '@/app/actions/applications';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  await auth.protect();

  const stats = await getApplicationStats();
  const allApps = await getApplications();
  const recentApps = allApps.slice(0, 5);

  return <DashboardClient stats={stats} recentApps={recentApps} />;
}
