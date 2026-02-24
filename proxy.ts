import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/learn", "/plans", "/tutor", "/profile"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // If accessing protected route without token, redirect to signin
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/learn/:path*", "/plans/:path*", "/tutor/:path*", "/profile/:path*"],
};