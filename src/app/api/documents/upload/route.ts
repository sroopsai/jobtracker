import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { createDocumentRecord } from '@/app/actions/documents';
import { DocumentType } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || file?.name || 'Untitled Document';
    const type = (formData.get('type') as DocumentType) || 'Resume';
    const textContent = (formData.get('textContent') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Format file size
    const bytes = file.size;
    let fileSizeFormatted = `${bytes} B`;
    if (bytes >= 1024 * 1024) {
      fileSizeFormatted = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (bytes >= 1024) {
      fileSizeFormatted = `${(bytes / 1024).toFixed(0)} KB`;
    }

    // Upload file to Vercel Blob storage
    const blob = await put(`documents/${userId}/${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Create database record
    const documentRecord = await createDocumentRecord({
      title,
      type,
      fileUrl: blob.url,
      downloadUrl: blob.downloadUrl,
      fileSize: fileSizeFormatted,
      textContent,
    });

    return NextResponse.json({ success: true, document: documentRecord });
  } catch (error: any) {
    console.error('Error uploading file to Vercel Blob:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}
