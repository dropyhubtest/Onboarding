import { NextRequest, NextResponse } from 'next/server';

const VALID_EMAIL = 'partners@admin.com';
const VALID_PASSWORD = 'Delivery#511';
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'dropyhub_admin_secure_key_2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (email.trim().toLowerCase() !== VALID_EMAIL || password !== VALID_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials. Please verify your email and password.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      token: ADMIN_SECRET,
      admin: {
        email: 'Partners@admin.com',
        name: 'Recruitment Operations Lead',
        role: 'admin',
      },
    });

    // Set secure auth cookie
    response.cookies.set('admin_token', ADMIN_SECRET, {
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
      httpOnly: false, // Accessible to client for header injection if needed
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication service encountered an error.' },
      { status: 500 }
    );
  }
}
