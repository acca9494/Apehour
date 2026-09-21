"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ClayButton } from "@/components/ui/clay-button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setSubmitting(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    setSubmitting(false);
    // Stessa risposta se l'email esiste o no, per non rivelare quali account sono registrati.
    if (err && err.status !== 400 && err.status !== 422) {
      setError(true);
      return;
    }
    setSent(true);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Recupero accesso</p>
        <h1>Password dimenticata?</h1>

        {sent ? (
          <>
            <p>
              Se l&apos;indirizzo <strong>{email}</strong> è registrato, ti abbiamo inviato una email con
              il link per scegliere una nuova password. Controlla anche lo spam.
            </p>
            <p className="auth-link">
              <Link href="/login">Torna all&apos;accesso</Link>
            </p>
          </>
        ) : (
          <>
            <p>Scrivi la tua email: ti mandiamo un link per impostare una nuova password.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              {error && (
                <div className="auth-error" role="alert">
                  Qualcosa è andato storto. Riprova tra un attimo.
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
              <ClayButton type="submit" className="auth-form__submit" disabled={submitting}>
                {submitting ? "Invio…" : "Invia il link"}
              </ClayButton>
            </form>
            <p className="auth-link">
              <Link href="/login">Torna all&apos;accesso</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
