"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import { ClayButton } from "@/components/ui/clay-button";
import { useLang } from "@/lib/i18n/context";

export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const a = t.auth;
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(a.passwordsNoMatch);
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) {
      setError(
        /different from the old|same as the old/i.test(err.message)
          ? a.samePassword
          : a.updateFailed
      );
      return;
    }
    setDone(true);
    setTimeout(() => router.replace(user?.role === "commerciante" ? "/dashboard" : "/profile"), 1800);
  }

  if (loading) return null;

  // Nessuna sessione di recupero: link scaduto, già usato o pagina aperta direttamente.
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">{a.recoverAccess}</p>
          <h1>{a.invalidLinkTitle}</h1>
          <p>{a.invalidLinkNote}</p>
          <p className="auth-link">
            <Link href="/forgot-password">{a.requestNewLink}</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">{a.recoverAccess}</p>
        <h1>{a.newPasswordTitle}</h1>

        {done ? (
          <p>{a.passwordUpdated}</p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}
            <label>
              {a.newPassword}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="minimo 8 caratteri"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            <label>
              {a.repeatPassword}
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="ripeti la password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            <ClayButton type="submit" className="auth-form__submit" disabled={submitting}>
              {submitting ? a.saving : a.savePassword}
            </ClayButton>
          </form>
        )}
      </div>
    </div>
  );
}
