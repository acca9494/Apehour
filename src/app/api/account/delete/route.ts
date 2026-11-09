import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { deleteUserAccount } from "@/lib/account/delete-user";

// Cancellazione account (diritto all'oblio, GDPR). Richiede la service role
// key: solo il server può eliminare un utente da auth.users, mai il client.
//
// Prima di eliminare, anonimizza i dati personali sullo storico prenotazioni/
// biglietti (nome/email/telefono) invece di bloccarne la cancellazione: quei
// record restano nello storico del locale come dato aggregato/di gestione,
// ma senza più informazioni identificative del cliente. Il profilo e tutto
// ciò che referenzia direttamente l'utente (preferiti, recensioni, eventuale
// locale di proprietà) viene invece eliminato in cascata dal database.
export async function POST() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Account deletion not configured" }, { status: 503 });
  }

  const server = await createServerClient();
  const { data: { user }, error: authErr } = await server.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await server.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "commerciante") {
    return NextResponse.json(
      { error: "Gli account locale non si eliminano da soli: usa \"Richiedi cancellazione\" nelle impostazioni del locale." },
      { status: 403 }
    );
  }

  const admin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const result = await deleteUserAccount(admin, user.id, user.email ?? null);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
