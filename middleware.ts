import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const PATIENT_ONLY = ["/dashboard/patient", "/bookings/new"];
const NURSE_ONLY = ["/dashboard/nurse", "/profile/edit"];
const SHARED_PROTECTED = ["/settings"];

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
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

  const payload = decodeJwt(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login?session=corrupted", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const isNurse = !!payload.is_nurse;
  const isPatient = !!payload.is_patient;

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) || pathname === "/") {
    const targetDashboard = isNurse ? "/dashboard/nurse" : "/dashboard/patient";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  if (pathname === "/dashboard") {
    const targetDashboard = isNurse ? "/dashboard/nurse" : "/dashboard/patient";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  if (NURSE_ONLY.some((route) => pathname.startsWith(route)) && !isNurse) {
    return NextResponse.redirect(new URL("/dashboard/patient", request.url));
  }

  if (PATIENT_ONLY.some((route) => pathname.startsWith(route)) && !isPatient) {
    return NextResponse.redirect(new URL("/dashboard/nurse", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
