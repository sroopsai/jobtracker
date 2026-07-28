'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { jobApplications, ApplicationStatus } from '@/db/schema';
import { eq, and, desc, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

async function requireAuthUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: You must be signed in.');
  }
  return userId;
}

export type ApplicationInput = {
  company: string;
  jobTitle: string;
  status: ApplicationStatus;
  applicationDate: string;
  jobUrl?: string | null;
  location?: string | null;
  salaryRange?: string | null;
  notes?: string | null;
};

export async function getApplications(search?: string, statusFilter?: string) {
  const userId = await requireAuthUser();

  const conditions = [eq(jobApplications.userId, userId)];

  if (statusFilter && statusFilter !== 'All') {
    conditions.push(eq(jobApplications.status, statusFilter as ApplicationStatus));
  }

  if (search && search.trim() !== '') {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(jobApplications.company, term),
        ilike(jobApplications.jobTitle, term),
        ilike(jobApplications.location, term)
      )!
    );
  }

  const results = await db
    .select()
    .from(jobApplications)
    .where(and(...conditions))
    .orderBy(desc(jobApplications.createdAt));

  return results;
}

export async function getApplicationStats() {
  const userId = await requireAuthUser();

  const apps = await db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId));

  const total = apps.length;
  const saved = apps.filter((a) => a.status === 'Saved').length;
  const applied = apps.filter((a) => a.status === 'Applied').length;
  const interview = apps.filter((a) => a.status === 'Interview').length;
  const offer = apps.filter((a) => a.status === 'Offer').length;
  const rejected = apps.filter((a) => a.status === 'Rejected').length;

  const chartData = [
    { name: 'Saved', count: saved, fill: '#64748b' },
    { name: 'Applied', count: applied, fill: '#3b82f6' },
    { name: 'Interview', count: interview, fill: '#8b5cf6' },
    { name: 'Offer', count: offer, fill: '#10b981' },
    { name: 'Rejected', count: rejected, fill: '#ef4444' },
  ];

  return {
    total,
    saved,
    applied,
    interview,
    offer,
    rejected,
    chartData,
  };
}

export async function createApplication(data: ApplicationInput) {
  const userId = await requireAuthUser();

  if (!data.company || !data.jobTitle || !data.applicationDate) {
    throw new Error('Company, Job Title, and Application Date are required.');
  }

  const [created] = await db
    .insert(jobApplications)
    .values({
      userId,
      company: data.company.trim(),
      jobTitle: data.jobTitle.trim(),
      status: data.status || 'Applied',
      applicationDate: data.applicationDate,
      jobUrl: data.jobUrl ? data.jobUrl.trim() : null,
      location: data.location ? data.location.trim() : null,
      salaryRange: data.salaryRange ? data.salaryRange.trim() : null,
      notes: data.notes ? data.notes.trim() : null,
    })
    .returning();

  revalidatePath('/dashboard');
  revalidatePath('/applications');
  return created;
}

export async function updateApplication(id: string, data: Partial<ApplicationInput>) {
  const userId = await requireAuthUser();

  const [updated] = await db
    .update(jobApplications)
    .set({
      ...(data.company && { company: data.company.trim() }),
      ...(data.jobTitle && { jobTitle: data.jobTitle.trim() }),
      ...(data.status && { status: data.status }),
      ...(data.applicationDate && { applicationDate: data.applicationDate }),
      ...(data.jobUrl !== undefined && { jobUrl: data.jobUrl ? data.jobUrl.trim() : null }),
      ...(data.location !== undefined && { location: data.location ? data.location.trim() : null }),
      ...(data.salaryRange !== undefined && { salaryRange: data.salaryRange ? data.salaryRange.trim() : null }),
      ...(data.notes !== undefined && { notes: data.notes ? data.notes.trim() : null }),
      updatedAt: new Date(),
    })
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .returning();

  if (!updated) {
    throw new Error('Application not found or unauthorized.');
  }

  revalidatePath('/dashboard');
  revalidatePath('/applications');
  return updated;
}

export async function deleteApplication(id: string) {
  const userId = await requireAuthUser();

  const deleted = await db
    .delete(jobApplications)
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .returning();

  if (deleted.length === 0) {
    throw new Error('Application not found or unauthorized.');
  }

  revalidatePath('/dashboard');
  revalidatePath('/applications');
  return true;
}
