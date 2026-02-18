import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_auth';

export function isAdminAuthenticated() {
  return cookies().get(COOKIE_NAME)?.value === '1';
}

export function setAdminCookie() {
  cookies().set(COOKIE_NAME, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export function clearAdminCookie() {
  cookies().delete(COOKIE_NAME);
}
