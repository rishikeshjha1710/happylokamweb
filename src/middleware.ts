import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE_KEY, ADMIN_SESSION_COOKIE_KEY, ROLE_COOKIE_KEY } from './lib/auth-constants';

const validRoles = new Set(['USER', 'PARTNER', 'ADMIN']);

function normalizeRole(role: string | null | undefined) {
  if (!role) {
    return null;
  }

  const normalizedRole = role.toUpperCase();

  if (normalizedRole === 'VENDOR') {
    return 'PARTNER';
  }

  return validRoles.has(normalizedRole) ? normalizedRole : null;
}

function getDashboardPath(role: string) {
  return role === 'PARTNER' ? '/dashboard/partner' : `/dashboard/${role.toLowerCase()}`;
}

function withSecurityHeaders(response: NextResponse, pathname: string) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/signup') {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Vary', 'Cookie');
  }

  return response;
}

export function middleware(request: NextRequest) {
  const role = normalizeRole(request.cookies.get(ROLE_COOKIE_KEY)?.value ?? null);
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value ?? null;
  const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE_KEY)?.value ?? null;
  const { pathname } = request.nextUrl;
  const hasAuthenticatedSession = Boolean(accessToken) && Boolean(role);
  const nextRole = hasAuthenticatedSession ? role : null;
  const isAdminPath = pathname.startsWith('/dashboard/admin');

  if ((pathname === '/login' || pathname === '/signup') && nextRole) {
    return withSecurityHeaders(NextResponse.redirect(new URL(getDashboardPath(nextRole), request.url)), pathname);
  }

  if (pathname === '/dashboard') {
    if (!nextRole) {
      return withSecurityHeaders(NextResponse.redirect(new URL('/login', request.url)), pathname);
    }

    return withSecurityHeaders(NextResponse.redirect(new URL(getDashboardPath(nextRole), request.url)), pathname);
  }

  if (pathname.startsWith('/dashboard/')) {
    if (!nextRole) {
      return withSecurityHeaders(NextResponse.redirect(new URL('/login', request.url)), pathname);
    }

    if (isAdminPath && (nextRole !== 'ADMIN' || adminSession !== 'active')) {
      return withSecurityHeaders(NextResponse.redirect(new URL('/login?role=ADMIN', request.url)), pathname);
    }

    const expectedPath = getDashboardPath(nextRole);
    if (pathname !== expectedPath) {
      return withSecurityHeaders(NextResponse.redirect(new URL(expectedPath, request.url)), pathname);
    }
  }

  return withSecurityHeaders(NextResponse.next(), pathname);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
