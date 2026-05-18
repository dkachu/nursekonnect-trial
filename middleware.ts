import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const PATIENT_ONLY = ["/dashboard/patient", "/bookings/new"];
const NURSE_ONLY = ["/dashboard/nurse", "/profile/edit"];

// Safe lightweight decoding algorithm reading stateless SimpleJWT claims on the edge
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // In Next.js Edge Runtime, atob resolves native buffer chunks cleanly
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Reads the cookie parameter injected by your Django backend's LoginView
  const tokenCookie = request.cookies.get("access_token");
  const token = tokenCookie?.value;

  // 1. Unauthenticated Visitor Routing Logic Boundaries
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

  // 2. Cryptographic Structural Token Sanity Scan
  const payload = decodeJwt(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login?session=corrupted", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const isNurse = !!payload.is_nurse;
  const isPatient = !!payload.is_patient;

  // 3. Authenticated Traffic Inversion Locks (Prevents logged-in users from hitting login forms)
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) || pathname === "/") {
    const targetDashboard = isNurse ? "/dashboard/nurse" : "/dashboard/patient";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // 4. Fallback Router (Resolves the root /dashboard layout down to role-based sub-paths)
  if (pathname === "/dashboard") {
    const targetDashboard = isNurse ? "/dashboard/nurse" : "/dashboard/patient";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // 5. Strict Role Boundaries & Cross-Access Isolation Rules
  if (NURSE_ONLY.some((route) => pathname.startsWith(route)) && !isNurse) {
    return NextResponse.redirect(new URL("/dashboard/patient", request.url));
  }

  if (PATIENT_ONLY.some((route) => pathname.startsWith(route)) && !isPatient) {
    return NextResponse.redirect(new URL("/dashboard/nurse", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Edge runtime matcher block skipping static assets optimization tracks
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
