import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const PATIENT_ONLY = ["/dashboard/patient", "/bookings/new"];
const NURSE_ONLY = ["/dashboard/nurse"];

// Parse stateless session parameters safely from token string slice
function decodeJwt(token: string) {
  try {
    const tokenParts = token.split(".");
    const base64Url = tokenParts[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get("access_token");
  const token = tokenCookie?.value;

  // Unauthenticated user boundaries
  if (!token) {
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
    if (!isAuthRoute && pathname !== "/") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("session", "expired");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Session verification and expiration evaluation checks
  const payload = decodeJwt(token);
  const currentTime = Math.floor(Date.now() / 1000);
  if (!payload || (payload.exp && payload.exp < currentTime)) {
    const response = NextResponse.redirect(new URL("/login?session=expired", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const isNurse = !!payload.is_nurse;
  const isPatient = !!payload.is_patient;

  // Redirect authenticated members away from standard sign-in screens
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) || pathname === "/") {
    const targetDashboard = isNurse ? "/dashboard/nurse" : "/dashboard/patient";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // Fallback router mapping generic dashboard targets to role paths
  if (pathname === "/dashboard") {
    if (!isNurse && !isPatient) {
      return NextResponse.redirect(new URL("/login?session=unauthorized", request.url));
    }
    const targetDashboard = isNurse ? "/dashboard/nurse" : "/dashboard/patient";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // Route isolation parameters guarding practitioner views
  if (NURSE_ONLY.some((route) => pathname.startsWith(route)) && !isNurse) {
    const fallback = isPatient ? "/dashboard/patient" : "/login?session=unauthorized";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  // Route isolation parameters guarding patient views
  if (PATIENT_ONLY.some((route) => pathname.startsWith(route)) && !isPatient) {
    const fallback = isNurse ? "/dashboard/nurse" : "/login?session=unauthorized";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
