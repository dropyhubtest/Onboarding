import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete('admin_token');
  return response;
}

export async function GET() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete('admin_token');
  return response;
}
