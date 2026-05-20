import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ANY = ["/profile", "/favorites"];
const PROTECTED_MERCHANT = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("appape_role")?.value;
  const uid = request.cookies.get("appape_uid")?.value;
  const isAuthenticated = !!(role && uid);

  // Logged-in users don't need to see auth pages
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && isAuthenticated) {
    const dest = role === "commerciante" ? "/dashboard" : "/profile";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Merchant-only routes
  if (PROTECTED_MERCHANT.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    if (role !== "commerciante") {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  // Any-auth routes
  if (PROTECTED_ANY.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/favorites", "/dashboard/:path*", "/login", "/register"],
};
