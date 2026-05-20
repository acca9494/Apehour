"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayButton } from "@/components/ui/clay-button";
import type { AuthErrorCode } from "@/lib/auth/types";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: "Email o password non corretti. Riprova.",
  email_taken: "Email già registrata.",
  unknown: "Qualcosa è andato storto. Riprova.",
};

const DEMO_ACCOUNTS = [
  { email: "cliente@demo.com", password: "demo123", label: "Cliente demo" },
  { email: "bar@demo.com", password: "demo123", label: "Commerciante demo" },
];

export default function LoginPage() {
  const { login, loginWithGoogle, loading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "commerciante" ? "/dashboard" : from);
    }
  }, [user, loading, router, from]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown";
      setError(code as AuthErrorCode);
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle("cliente");
    } catch {
      setError("unknown");
      setGoogleLoading(false);
    }
  }

  function fillDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  }

  if (loading) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Bentornato</p>
        <h1>Accedi</h1>
        <p>Scopri i migliori bar e prenota il tuo aperitivo.</p>

        <button type="button" className="google-btn" onClick={handleGoogle} disabled={googleLoading || submitting}>
          <GoogleIcon />
          {googleLoading ? "Connessione…" : "Continua con Google"}
        </button>
        <div className="auth-divider"><span>oppure via email</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" role="alert">
              {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown}
            </div>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="la@tua-email.com"
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              minLength={6}
            />
          </label>

          <ClayButton
            type="submit"
            className="auth-form__submit"
            disabled={submitting}
          >
            {submitting ? "Accesso in corso…" : "Accedi"}
          </ClayButton>
        </form>

        <p className="auth-link">
          Non hai un account?{" "}
          <Link href="/register">Registrati gratis</Link>
        </p>

        <div className="auth-demo">
          <p>Account demo — prova subito senza registrarti</p>
          <div className="auth-demo-accounts">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                className="auth-demo-btn"
                onClick={() => fillDemo(a)}
              >
                {a.email}
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
