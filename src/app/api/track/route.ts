import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Analytics interne, anonime: nessun IP salvato, nessun cookie persistente.
// session_id arriva da sessionStorage del browser (si azzera a fine sessione).

const hits = new Map<string, number[]>();
function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60 * 1000);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > 60;
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 && t.length <= max ? t : null;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return NextResponse.json({ ok: false }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const path = str(body.path, 300);
  const sessionId = str(body.sessionId, 80);
  const referrer = str(body.referrer, 300);

  if (!path || !path.startsWith("/") || !sessionId) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const service = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await service.from("page_views").insert({
    path,
    referrer,
    session_id: sessionId,
  });
  if (error) console.error("page_views insert failed:", error.message);

  return NextResponse.json({ ok: true });
}
