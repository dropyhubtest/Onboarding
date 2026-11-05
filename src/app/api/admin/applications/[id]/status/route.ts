import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { updateApplicationStatus } from '@/lib/db';
import { ApplicationStatus } from '@/types';

const VALID_STATUSES: ApplicationStatus[] = [
  'Pending Review',
  'Under Review',
  'Additional Information Required',
  'Approved',
  'Rejected',
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
    const { status, reason } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (status === 'Rejected' && (!reason || reason.trim().length === 0)) {
      return NextResponse.json(
        { error: 'A rejection reason is mandatory when setting status to Rejected.' },
        { status: 400 }
      );
    }

    const updated = updateApplicationStatus(id, status, admin.name, reason);

    return NextResponse.json({
      success: true,
      application: updated,
    });
  } catch (error: any) {
    console.error('Admin update status error:', error?.message || error);
    return NextResponse.json({ error: error.message || 'Failed to update status.' }, { status: 500 });
  }
}
