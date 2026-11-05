import { NextRequest } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'dropyhub_admin_secure_key_2026';

export interface AdminUser {
  role: 'admin';
  name: string;
}

export function verifyAdminAuth(req: NextRequest): AdminUser | null {
  // Check authorization header or custom header
  const authHeader = req.headers.get('authorization');
  const customHeader = req.headers.get('x-admin-key');
  const cookieKey = req.cookies.get('admin_token')?.value;

  let providedToken = '';

  if (customHeader) {
    providedToken = customHeader;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7);
  } else if (cookieKey) {
    providedToken = cookieKey;
  }

  if (!providedToken) {
    return null;
  }

  // Constant-time comparison or direct check
  if (providedToken === ADMIN_SECRET) {
    const adminName = req.headers.get('x-admin-name') || 'Administrator';
    return {
      role: 'admin',
      name: adminName,
    };
  }

  return null;
}
