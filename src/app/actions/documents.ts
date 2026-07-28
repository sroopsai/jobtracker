'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { documents, DocumentType, documentTypes } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { del } from '@vercel/blob';

async function requireAuthUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: You must be signed in.');
  }
  return userId;
}

export interface CreateDocumentInput {
  title: string;
  type: DocumentType;
  fileUrl: string;
  downloadUrl?: string;
  fileSize?: string;
  textContent?: string;
}

export async function getDocuments(typeFilter?: string) {
  const userId = await requireAuthUser();

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

export async function createDocumentRecord(data: CreateDocumentInput) {
  const userId = await requireAuthUser();

  if (!data.title || !data.fileUrl) {
    throw new Error('Document title and file URL are required.');
  }

  const [created] = await db
    .insert(documents)
    .values({
      userId,
      title: data.title.trim(),
      type: data.type || 'Resume',
      fileUrl: data.fileUrl,
      downloadUrl: data.downloadUrl || data.fileUrl,
      fileSize: data.fileSize || 'N/A',
      textContent: data.textContent || null,
    })
    .returning();

  revalidatePath('/documents');
  return created;
}

export async function deleteDocumentRecord(id: string) {
  const userId = await requireAuthUser();

  const [found] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)));

  if (!found) {
    throw new Error('Document not found or unauthorized.');
  }

  // Best effort delete from Vercel Blob if fileUrl starts with blob URL
  try {
    if (found.fileUrl && found.fileUrl.includes('blob.vercel-storage.com')) {
      await del(found.fileUrl);
    }
  } catch (e) {
    console.error('Error deleting blob from Vercel Storage:', e);
  }

  await db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)));

  revalidatePath('/documents');
  return true;
}
