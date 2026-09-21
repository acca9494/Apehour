import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Registrazione dei locali senza conferma email: l'account viene creato già
// confermato, così il locale prosegue il form (call) e accede subito. Solo i
// locali passano di qui; i clienti restano sulla conferma email standard.
// Il locale non è pubblico finché non viene verificato manualmente.

const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 && t.length <= max ? t : null;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "unknown" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "unknown" }, { status: 400 });
  }

  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const password = typeof body.password === "string" ? body.password : "";
  const venueName = str(body.venueName, 160);
  const venueAddress = str(body.venueAddress, 250);
  const venueCity = str(body.venueCity, 80);
  const venuePriceRange = str(body.venuePriceRange, 8);
  const eventSource = str(body.eventSource, 80);

  if (
    !name || !email || !/^\S+@\S+\.\S+$/.test(email) ||
    password.length < 8 || password.length > 128 ||
    !venueName || !venueAddress || body.privacyAccepted !== true
  ) {
    return NextResponse.json({ error: "unknown" }, { status: 400 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role: "commerciante",
      venue_name: venueName,
      venue_address: venueAddress,
      venue_city: venueCity ?? "Roma",
      venue_price_range: venuePriceRange ?? "$$",
      privacy_accepted_at: new Date().toISOString(),
      ...(eventSource ? { event_source: eventSource } : {}),
    },
  });

  if (error) {
    const taken = /already|registered|exists/i.test(error.message);
    if (!taken) console.error("merchant-signup failed:", error.message);
    return NextResponse.json({ error: taken ? "email_taken" : "unknown" }, { status: taken ? 409 : 500 });
  }

  return NextResponse.json({ ok: true });
}
