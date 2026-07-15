import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  const isAdminHost = hostname.startsWith('admin.');

  if (isAdminHost) {
    // On admin.xdisturb.et, root "/" should land on the login page
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } else {
    // Optional: keep admin routes off the main public domain
    // if (pathname.startsWith('/dashboard') || pathname.startsWith('/auth')) {
    //   return NextResponse.redirect(new URL(`https://admin.${hostname}${pathname}`, request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};