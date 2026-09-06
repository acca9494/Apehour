import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Client Supabase per Server Components / Route Handlers.
// Legge/scrive i cookie di sessione tramite l'API cookies() di Next.js.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll chiamato da un Server Component: ignorabile se c'è un
            // middleware che rinfresca la sessione ad ogni richiesta.
          }
        },
      },
    }
  );
}
