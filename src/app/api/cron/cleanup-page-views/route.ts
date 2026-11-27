import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Lanciata quotidianamente da Vercel Cron (vedi vercel.json) per cancellare le
// visite più vecchie di 13 mesi, in linea con la Privacy/Cookie Policy.
// Protetta da CRON_SECRET: solo Vercel (che lo manda come Bearer token nelle
// richieste cron) può invocarla.

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return NextResponse.json({ error: "unknown" }, { status: 503 });
  const service = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 13);

  const { error, count } = await service
    .from("page_views")
    .delete({ count: "exact" })
    .lt("created_at", cutoff.toISOString());

  if (error) {
    console.error("cleanup-page-views failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: count ?? 0 });
}
