import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteUserAccount } from "@/lib/account/delete-user";

// Eliminazione decisa dall'admin dopo aver contattato il locale che ha
// richiesto la cancellazione (vedi /api/account/request-delete). Elimina
// l'utente da auth.users: profilo e locale vengono rimossi in cascata.
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });

  const { ownerId } = await request.json();
  if (!ownerId) return NextResponse.json({ error: "unknown" }, { status: 400 });

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return NextResponse.json({ error: "unknown" }, { status: 503 });
  const service = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData } = await service.auth.admin.getUserById(ownerId);
  const result = await deleteUserAccount(service, ownerId, userData?.user?.email ?? null);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true });
}
