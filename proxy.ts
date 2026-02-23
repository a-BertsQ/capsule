import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/learn", "/plans", "/tutor"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (path === "/" && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (path === "/signin" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signin", "/dashboard/:path*", "/learn/:path*", "/plans/:path*", "/tutor/:path*"],
};