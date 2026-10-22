import { createClient } from "@/lib/supabase/server";

// Unico amministratore per ora (fase pilota, 25 locali test): un solo
// indirizzo hardcoded invece di un ruolo "admin" nel database — niente nuova
// colonna/RLS da proteggere, e la Scelta di chi sia admin dipende da te, non
// da un dato modificabile a runtime.
const ADMIN_EMAILS = ["aleacca94@gmail.com"];

export async function requireAdmin(): Promise<{ email: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) return null;
  return { email: user.email };
}
