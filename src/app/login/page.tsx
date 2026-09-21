"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayButton } from "@/components/ui/clay-button";
import type { AuthErrorCode } from "@/lib/auth/types";

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: "Email o password non corretti. Riprova.",
  email_taken: "Email già registrata.",
  email_confirmation_required: "Conferma prima la tua email dal link che ti abbiamo inviato.",
  unknown: "Qualcosa è andato storto. Riprova.",
};

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(null);

  useEffect(() => {
    if (!loading && user) {
      const dest = user.role === "commerciante" ? "/dashboard" : from;
      router.replace(dest);
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

  if (loading) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Bentornato</p>
        <h1>Accedi</h1>
        <p>Scopri i migliori bar e prenota il tuo aperitivo.</p>

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
          <Link href="/forgot-password">Password dimenticata?</Link>
        </p>

        <p className="auth-link">
          Non hai un account?{" "}
          <Link href="/register">Registrati gratis</Link>
        </p>
      </div>
    </div>
  );
}
