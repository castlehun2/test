import { NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/admin-auth';

export async function POST(request: Request) {
  clearAdminCookie();
  return NextResponse.redirect(new URL('/admin', request.url));
}
