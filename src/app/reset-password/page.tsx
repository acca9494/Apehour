"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import { ClayButton } from "@/components/ui/clay-button";

export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
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
      setError("Le due password non coincidono.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) {
      setError(
        /different from the old|same as the old/i.test(err.message)
          ? "Scegli una password diversa da quella attuale."
          : "Non siamo riusciti ad aggiornare la password. Riprova."
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
          <p className="eyebrow">Recupero accesso</p>
          <h1>Link non valido</h1>
          <p>Il link è scaduto o è già stato usato. Richiedine uno nuovo.</p>
          <p className="auth-link">
            <Link href="/forgot-password">Richiedi un nuovo link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Recupero accesso</p>
        <h1>Nuova password</h1>

        {done ? (
          <p>Password aggiornata! Ti stiamo portando nel tuo account…</p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}
            <label>
              Nuova password
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
              Ripeti la password
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
              {submitting ? "Salvataggio…" : "Salva la nuova password"}
            </ClayButton>
          </form>
        )}
      </div>
    </div>
  );
}
