import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAINTENANCE = true;

const PROTECTED_ANY = ["/profile", "/favorites"];
const PROTECTED_MERCHANT = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Maintenance mode ──────────────────────────────
  if (MAINTENANCE) {
    if (pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
    // On the maintenance page: pass through with a custom header
    const res = NextResponse.next();
    res.headers.set("x-maintenance", "1");
    return res;
  }

  const role = request.cookies.get("appape_role")?.value;
  const uid = request.cookies.get("appape_uid")?.value;
  const isAuthenticated = !!(role && uid);

  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && isAuthenticated) {
    const dest = role === "commerciante" ? "/dashboard" : "/profile";
    return NextResponse.redirect(new URL(dest, request.url));
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)"],
};
