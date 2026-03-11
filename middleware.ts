import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from './lib/admin/constants';

function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isStudioPath(pathname: string) {
  return pathname === '/studio' || pathname.startsWith('/studio/');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname)) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isLoginRoute = pathname.startsWith('/admin/login');

    if (!session && !isLoginRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      if (pathname !== '/admin/login') {
        loginUrl.searchParams.set('from', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    if (session && isLoginRoute) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/admin/puppies';
      dashboardUrl.search = '';
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Protect Sanity Studio in production — require the same admin session cookie.
  // In development, studio is accessible freely for convenience.
  if (isStudioPath(pathname) && process.env.NODE_ENV === 'production') {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/studio', '/studio/:path*'],
};
