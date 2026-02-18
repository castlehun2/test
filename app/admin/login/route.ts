import { NextResponse } from 'next/server';
import { setAdminCookie } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get('password');

  if (typeof password !== 'string' || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin?error=1', request.url));
  }

  setAdminCookie();
  return NextResponse.redirect(new URL('/admin', request.url));
}
