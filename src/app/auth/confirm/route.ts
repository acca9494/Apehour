import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Link di recupero password nella email: verifica il token direttamente (senza
// PKCE), così funziona anche se la mail viene aperta su un altro dispositivo o
// browser rispetto a quello da cui è stato richiesto il reset.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");

  if (tokenHash && searchParams.get("type") === "recovery") {
    const supabase = await createClient();
    await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
  }

  // Se il token non era valido non c'è sessione e la pagina lo segnala.
  return NextResponse.redirect(`${origin}/reset-password`);
}
