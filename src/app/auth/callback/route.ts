import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Riceve il redirect di Supabase dopo un login OAuth (es. Google), scambia il
// code per una sessione e — al primo accesso — imposta il ruolo scelto
// (passato nel nostro redirectTo, non in un query param di Google: è l'unico
// modo affidabile per farlo sopravvivere al round-trip del provider OAuth).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role") === "commerciante" ? "commerciante" : "cliente";
  const next = role === "commerciante" ? "/dashboard" : "/profile";

  // Link di recupero password: scambia il code e manda alla pagina "nuova password".
  // Se il code è scaduto/già usato non c'è sessione e quella pagina lo segnala.
  if (searchParams.get("type") === "recovery") {
    if (code) {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
    }
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Solo al primo accesso (nessun ruolo ancora salvato): fissa il ruolo scelto.
      // L'update su profiles.role richiede la service role key: un trigger sul
      // database blocca il cambio di ruolo quando arriva dalla sessione normale
      // dell'utente (altrimenti un cliente potrebbe auto-promuoversi a
      // commerciante chiamando direttamente la tabella).
      if (!data.user.user_metadata?.role) {
        await supabase.auth.updateUser({ data: { role } });
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceRoleKey) {
          const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });
          await admin.from("profiles").update({ role }).eq("id", data.user.id);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
