import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/profile', '/dashboard', '/setup', '/bookings'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const cookieName = process.env.AUTH_COOKIE || process.env.NEXT_PUBLIC_AUTH_COOKIE || 'access_token';
  const hasToken = request.cookies.has(cookieName);

  const matchesRoute = (routes: string[]) => 
    routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  // 1. Enforce login requirements on protected routes
  if (matchesRoute(protectedRoutes) && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('session', 'expired');
    loginUrl.searchParams.set('callbackUrl', pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // 2. MODIFIED: Let authenticated traffic pass through auth landing pages.
  // Your Context Layout Guard will handle role routing cleanly.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
