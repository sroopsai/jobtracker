import { auth } from '@clerk/nextjs/server';
import { getApplications } from '@/app/actions/applications';
import { ApplicationsClient } from './ApplicationsClient';

export default async function ApplicationsPage() {
  await auth.protect();

  const applications = await getApplications();

  return <ApplicationsClient initialApplications={applications} />;
}
