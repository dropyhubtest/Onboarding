import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { updateKotakAccountStatusAsync } from '@/lib/db';
import { KotakAccountStatus } from '@/types';

const VALID_KOTAK_STATUSES: KotakAccountStatus[] = [
  'Pending',
  'Completion Awaited',
  'Completed',
  'Verification Required',
  'Failed',
];

export async function PATCH(
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
    const { status } = body;

    if (!status || !VALID_KOTAK_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid Kotak status. Must be one of: ${VALID_KOTAK_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await updateKotakAccountStatusAsync(id, status, admin.name);

    return NextResponse.json({
      success: true,
      application: updated,
    });
  } catch (error: any) {
    console.error('Admin update Kotak status error:', error?.message || error);
    return NextResponse.json({ error: error.message || 'Failed to update Kotak status.' }, { status: 500 });
  }
}
