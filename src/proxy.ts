import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const MAINTENANCE = false;

const PROTECTED_ANY = ["/profile", "/favorites"];
const PROTECTED_MERCHANT = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

function homeFor(role: string | undefined): string {
  if (role === "commerciante") return "/dashboard";
  return "/profile";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Maintenance mode ──────────────────────────────
  if (MAINTENANCE && pathname !== "/maintenance") {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    const res = NextResponse.rewrite(url);
    res.headers.set("x-maintenance", "1");
    return res;
  }

  if (MAINTENANCE && pathname === "/maintenance") {
    const res = NextResponse.next();
    res.headers.set("x-maintenance", "1");
    return res;
  }

  // updateSession valida la sessione col server Auth di Supabase (mai un cookie
  // letto e basta) e rinfresca il refresh token se necessario.
  const { response, user } = await updateSession(request);
  const role = user?.user_metadata?.role as string | undefined;
  const isAuthenticated = !!user;

  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && isAuthenticated) {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }

  if (PROTECTED_MERCHANT.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    if (role !== "commerciante") {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
  }

  if (PROTECTED_ANY.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)"],
};
