import { NextRequest } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'dropyhub_admin_secure_key_2026';

export interface AdminUser {
  role: 'admin';
  name: string;
}

export function verifyAdminAuth(req: NextRequest): AdminUser | null {
  // Check authorization header, custom header, query param, or cookie
  const authHeader = req.headers.get('authorization');
  const customHeader = req.headers.get('x-admin-key');
  const cookieKey = req.cookies.get('admin_token')?.value;
  const queryKey = req.nextUrl.searchParams.get('adminKey') || req.nextUrl.searchParams.get('key');

  let providedToken = '';

  if (queryKey) {
    providedToken = queryKey;
  } else if (customHeader) {
    providedToken = customHeader;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7);
  } else if (cookieKey) {
    providedToken = cookieKey;
  }

  if (!providedToken) {
    return null;
  }

  // Verification check against ADMIN_SECRET
  if (providedToken === ADMIN_SECRET) {
    const adminName =
      req.headers.get('x-admin-name') ||
      req.nextUrl.searchParams.get('adminName') ||
      'Administrator';
    return {
      role: 'admin',
      name: adminName,
    };
  }

  return null;
}
