import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { getDocumentById } from '@/lib/db';
import { readDocumentFileAsync } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminAuth(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin credentials required to access documents.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const docRecord = getDocumentById(id);

    if (!docRecord) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    const fileBuffer = await readDocumentFileAsync(docRecord.file_path, docRecord.stored_file_name);

    // Stream document securely to authorized administrator
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': docRecord.mime_type,
        'Content-Disposition': `inline; filename="${encodeURIComponent(docRecord.original_file_name)}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Admin stream document error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to access document.' }, { status: 500 });
  }
}
