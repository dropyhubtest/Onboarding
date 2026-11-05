import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { getApplicationDetailByIdAsync } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminAuth(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const detail = await getApplicationDetailByIdAsync(id);

    if (!detail) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      application: detail,
    });
  } catch (error: any) {
    console.error('Admin get application detail error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to retrieve application details.' }, { status: 500 });
  }
}
