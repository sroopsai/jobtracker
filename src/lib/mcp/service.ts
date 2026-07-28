import { db } from '@/db';
import { jobApplications, ApplicationStatus, applicationStatuses, documents, DocumentType, documentTypes } from '@/db/schema';
import { eq, and, desc, ilike, or } from 'drizzle-orm';
import { del } from '@vercel/blob';

export interface CreateApplicationParams {
  userId: string;
  company: string;
  jobTitle: string;
  status?: ApplicationStatus;
  applicationDate?: string;
  jobUrl?: string | null;
  location?: string | null;
  salaryRange?: string | null;
  notes?: string | null;
}

export interface UpdateApplicationParams {
  userId: string;
  id: string;
  company?: string;
  jobTitle?: string;
  status?: ApplicationStatus;
  applicationDate?: string;
  jobUrl?: string | null;
  location?: string | null;
  salaryRange?: string | null;
  notes?: string | null;
}

export async function mcpListApplications(userId: string, search?: string, statusFilter?: string) {
  const conditions = [eq(jobApplications.userId, userId)];

  if (statusFilter && statusFilter !== 'All' && applicationStatuses.includes(statusFilter as ApplicationStatus)) {
    conditions.push(eq(jobApplications.status, statusFilter as ApplicationStatus));
  }

  if (search && search.trim() !== '') {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(jobApplications.company, term),
        ilike(jobApplications.jobTitle, term),
        ilike(jobApplications.location, term),
        ilike(jobApplications.notes, term)
      )!
    );
  }

  return await db
    .select()
    .from(jobApplications)
    .where(and(...conditions))
    .orderBy(desc(jobApplications.createdAt));
}

export async function mcpAddApplication(params: CreateApplicationParams) {
  const today = new Date().toISOString().split('T')[0];
  const [created] = await db
    .insert(jobApplications)
    .values({
      userId: params.userId,
      company: params.company.trim(),
      jobTitle: params.jobTitle.trim(),
      status: params.status || 'Applied',
      applicationDate: params.applicationDate || today,
      jobUrl: params.jobUrl ? params.jobUrl.trim() : null,
      location: params.location ? params.location.trim() : null,
      salaryRange: params.salaryRange ? params.salaryRange.trim() : null,
      notes: params.notes ? params.notes.trim() : null,
    })
    .returning();

  return created;
}

export async function mcpUpdateApplication(params: UpdateApplicationParams) {
  const [updated] = await db
    .update(jobApplications)
    .set({
      ...(params.company && { company: params.company.trim() }),
      ...(params.jobTitle && { jobTitle: params.jobTitle.trim() }),
      ...(params.status && { status: params.status }),
      ...(params.applicationDate && { applicationDate: params.applicationDate }),
      ...(params.jobUrl !== undefined && { jobUrl: params.jobUrl ? params.jobUrl.trim() : null }),
      ...(params.location !== undefined && { location: params.location ? params.location.trim() : null }),
      ...(params.salaryRange !== undefined && { salaryRange: params.salaryRange ? params.salaryRange.trim() : null }),
      ...(params.notes !== undefined && { notes: params.notes ? params.notes.trim() : null }),
      updatedAt: new Date(),
    })
    .where(and(eq(jobApplications.id, params.id), eq(jobApplications.userId, params.userId)))
    .returning();

  return updated || null;
}

export async function mcpDeleteApplication(userId: string, id: string) {
  const deleted = await db
    .delete(jobApplications)
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .returning();

  return deleted.length > 0;
}

export async function mcpGetAnalytics(userId: string) {
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

  const totalProcessed = applied + interview + offer + rejected;
  const responseRate = totalProcessed > 0 ? (((interview + offer + rejected) / totalProcessed) * 100).toFixed(1) : '0';
  const offerRate = totalProcessed > 0 ? ((offer / totalProcessed) * 100).toFixed(1) : '0';

  return {
    total,
    saved,
    applied,
    interview,
    offer,
    rejected,
    responseRatePercent: Number(responseRate),
    offerRatePercent: Number(offerRate),
  };
}

// MCP Document Functions
export async function mcpListDocuments(userId: string, typeFilter?: string) {
  const conditions = [eq(documents.userId, userId)];
  if (typeFilter && typeFilter !== 'All' && documentTypes.includes(typeFilter as DocumentType)) {
    conditions.push(eq(documents.type, typeFilter as DocumentType));
  }

  return await db
    .select()
    .from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.createdAt));
}

export async function mcpGetDocumentContent(userId: string, documentId: string) {
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

  return doc || null;
}

export async function mcpDeleteDocument(userId: string, documentId: string) {
  const [found] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

  if (!found) return false;

  try {
    if (found.fileUrl && found.fileUrl.includes('blob.vercel-storage.com')) {
      await del(found.fileUrl);
    }
  } catch (e) {
    console.error('Error deleting blob:', e);
  }

  await db
    .delete(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

  return true;
}
