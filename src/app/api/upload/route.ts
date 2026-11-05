import { NextRequest, NextResponse } from 'next/server';
import { validateDocumentFile, saveDocumentBuffer } from '@/lib/storage';
import { saveDocumentRecordAsync } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No document file uploaded.' }, { status: 400 });
    }

    if (!documentType || !['aadhaar', 'pan'].includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type. Must be "aadhaar" or "pan".' },
        { status: 400 }
      );
    }

    const validation = validateDocumentFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storedInfo = await saveDocumentBuffer(
      buffer,
      file.name,
      file.type,
      documentType as 'aadhaar' | 'pan'
    );

    // Persist document record to Neon Postgres & local DB - fully awaited for serverless
    const docRecord = await saveDocumentRecordAsync({
      id: storedInfo.documentId,
      document_type: documentType as 'aadhaar' | 'pan',
      original_file_name: storedInfo.originalFileName,
      stored_file_name: storedInfo.storedFileName,
      file_path: storedInfo.filePath,
      file_size: storedInfo.fileSize,
      mime_type: storedInfo.mimeType,
      file_content: storedInfo.base64Content,
      verification_status: 'Unverified',
      uploaded_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      documentId: docRecord.id,
      documentType: docRecord.document_type,
      originalFileName: docRecord.original_file_name,
      fileSize: docRecord.file_size,
      mimeType: docRecord.mime_type,
    });
  } catch (error: any) {
    console.error('Document upload error:', error?.message || error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving the document securely.' },
      { status: 500 }
    );
  }
}
