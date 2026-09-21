import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      if (!data.user.user_metadata?.role) {
        await supabase.auth.updateUser({ data: { role } });
        await supabase.from("profiles").update({ role }).eq("id", data.user.id);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
