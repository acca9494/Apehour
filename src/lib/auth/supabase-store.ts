import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser, AuthSession, LoginCredentials, RegisterData, UserRole } from "./types";

// name/role sono letti da user_metadata (impostati alla registrazione e sincronizzati
// nella tabella profiles dal trigger handle_new_user) — evita una query extra ad ogni login.
function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.name as string | undefined) ?? user.email?.split("@")[0] ?? "Utente",
    role: (user.user_metadata?.role as UserRole | undefined) ?? "cliente",
    createdAt: user.created_at,
  };
}

export async function getSession(): Promise<AuthSession | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return { user: toAuthUser(session.user), token: session.access_token };
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error || !data.session) {
    throw new Error(error?.message === "Invalid login credentials" ? "invalid_credentials" : "unknown");
  }
  return { user: toAuthUser(data.user), token: data.session.access_token };
}

export async function register(data: RegisterData): Promise<AuthSession> {
  const supabase = createClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { name: data.name, role: data.role, ...data.metadata },
      emailRedirectTo: `${window.location.origin}/auth/confirmed`,
    },
  });

  if (error) {
    console.error("[register] Supabase error:", error.message, error);
    throw new Error(error.message.toLowerCase().includes("already registered") ? "email_taken" : "unknown");
  }
  if (!signUpData.session || !signUpData.user) {
    // Progetto con "Confirm email" attivo: l'utente deve confermare via email prima di avere una sessione.
    throw new Error("email_confirmation_required");
  }

  return { user: toAuthUser(signUpData.user), token: signUpData.session.access_token };
}

export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// Richiede il provider Google configurato in Supabase (Authentication → Providers → Google)
// con Client ID/Secret validi — finché non è configurato, la chiamata fallisce silenziosamente
// lato Supabase (redirect di errore). Non blocca il resto dell'autenticazione email/password.
export async function loginWithGoogle(role: UserRole = "cliente"): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
    },
  });
  // Redirect verso Google in corso: il browser lascia la pagina qui, nessuna sessione da restituire.
}
