import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { listApplicationsAsync } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = verifyAdminAuth(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const city = searchParams.get('city') || undefined;
    const kotakStatus = searchParams.get('kotakStatus') || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'submitted_at';
    const sortOrder = (searchParams.get('sortOrder') as any) || 'DESC';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    const result = await listApplicationsAsync({
      search,
      status,
      category,
      city,
      kotakStatus,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Admin list applications error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to retrieve applications.' }, { status: 500 });
  }
}
