import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ADMIN_EMAILS } from "@/lib/admin/constants";

// Attiva/disattiva qui per la produzione (Vercel). In locale (`npm run dev`)
// resta sempre disattivata in automatico, così non serve ricordarsi di
// girare il flag avanti e indietro ogni volta che testiamo qualcosa.
const MAINTENANCE_WHEN_LIVE = true;
const MAINTENANCE = MAINTENANCE_WHEN_LIVE && process.env.NODE_ENV === "production";
// Esclusi dalla manutenzione: /admin (devi poterci lavorare anche a sito
// fermo), /api (le email automatiche e le route server devono continuare
// a funzionare), e /register /login /dashboard /profile per permettere
// l'onboarding rapido di un locale anche mentre il resto del sito è fermo
// (il locale non diventa comunque visibile al pubblico finché non lo
// verifichi da /admin). /profile serve perché dopo il login un account
// cliente viene rimandato lì prima di poter raggiungere /admin.
const MAINTENANCE_EXEMPT = ["/admin", "/api", "/register", "/login", "/dashboard", "/profile"];

const PROTECTED_ANY = ["/profile", "/favorites"];
const PROTECTED_MERCHANT = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

function homeFor(role: string | undefined, email: string | undefined): string {
  if (email && ADMIN_EMAILS.includes(email)) return "/admin";
  if (role === "commerciante") return "/dashboard";
  return "/profile";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Maintenance mode ──────────────────────────────
  if (MAINTENANCE && pathname !== "/maintenance" && !MAINTENANCE_EXEMPT.some((r) => pathname.startsWith(r))) {
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
  const { response, user, role } = await updateSession(request);
  const isAuthenticated = !!user;

  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && isAuthenticated) {
    return NextResponse.redirect(new URL(homeFor(role, user.email), request.url));
  }

  if (PROTECTED_MERCHANT.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    if (role !== "commerciante") {
      return NextResponse.redirect(new URL(homeFor(role, user.email), request.url));
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
