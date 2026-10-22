"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ClayButton } from "@/components/ui/clay-button";
import { useLang } from "@/lib/i18n/context";

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const a = t.auth;
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
        <p className="eyebrow">{a.recoverAccess}</p>
        <h1>{a.forgotTitle}</h1>

        {sent ? (
          <>
            <p>
              {a.forgotSentNote(email)}
            </p>
            <p className="auth-link">
              <Link href="/login">{a.backToLogin}</Link>
            </p>
          </>
        ) : (
          <>
            <p>{a.forgotSub}</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              {error && (
                <div className="auth-error" role="alert">
                  {a.genericError}
                </div>
              )}
              <label>
                {a.email}
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
                {submitting ? a.sending : a.sendLink}
              </ClayButton>
            </form>
            <p className="auth-link">
              <Link href="/login">{a.backToLogin}</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
