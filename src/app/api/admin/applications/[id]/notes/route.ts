import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { addAdminNote } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminAuth(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { note } = body;

    if (!note || note.trim().length === 0) {
      return NextResponse.json({ error: 'Administrative note content cannot be empty.' }, { status: 400 });
    }

    const updated = addAdminNote(id, note.trim(), admin.name);

    return NextResponse.json({
      success: true,
      application: updated,
    });
  } catch (error: any) {
    console.error('Admin add note error:', error?.message || error);
    return NextResponse.json({ error: error.message || 'Failed to add note.' }, { status: 500 });
  }
}
