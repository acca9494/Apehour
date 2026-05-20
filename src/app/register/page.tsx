"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayButton } from "@/components/ui/clay-button";
import { MerchantRegisterForm } from "@/components/home/merchant-register-form";
import type { AuthErrorCode } from "@/lib/auth/types";

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: "Credenziali non valide.",
  email_taken: "Email già registrata. Prova ad accedere.",
  unknown: "Qualcosa è andato storto. Riprova.",
};

export default function RegisterPage() {
  const { register, loading, user } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"cliente" | "commerciante">("cliente");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "commerciante" ? "/dashboard" : "/profile");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ name, email, password, role: "cliente" });
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown";
      setError(code as AuthErrorCode);
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <div className="auth-page">
      <div className={`auth-card ${mode === "commerciante" ? "auth-card--merchant" : ""}`}>

        {/* Mode toggle */}
        <div className="reg-mode-toggle">
          <button
            type="button"
            className={`reg-mode-toggle__btn ${mode === "cliente" ? "is-active" : ""}`}
            onClick={() => { setMode("cliente"); setError(null); }}
          >
            Sono un cliente
          </button>
          <button
            type="button"
            className={`reg-mode-toggle__btn ${mode === "commerciante" ? "is-active" : ""}`}
            onClick={() => { setMode("commerciante"); setError(null); }}
          >
            Ho un locale
          </button>
        </div>

        {mode === "cliente" && (
          <>
            <p className="eyebrow" style={{ marginTop: "1rem" }}>Crea account</p>
            <h1>Registrati</h1>
            <p>Gratis. Nessuna carta di credito richiesta.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && (
                <div className="auth-error" role="alert">
                  {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown}
                </div>
              )}

              <label>
                Nome completo
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Mario Rossi" required autoComplete="name" />
              </label>

              <label>
                Email
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="la@tua-email.com" required autoComplete="email" />
              </label>

              <label>
                Password
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="minimo 6 caratteri" required autoComplete="new-password" minLength={6} />
              </label>

              <ClayButton type="submit" className="auth-form__submit" disabled={submitting}>
                {submitting ? "Creazione account…" : "Crea account"}
              </ClayButton>
            </form>

            <p className="auth-link">
              Hai già un account? <Link href="/login">Accedi</Link>
            </p>
          </>
        )}

        {mode === "commerciante" && (
          <>
            <p className="eyebrow" style={{ marginTop: "1rem" }}>Registra il tuo locale</p>
            <h1>Per i locali</h1>
            <p>Gratis per i primi 30 giorni. Nessun contratto.</p>
            <div style={{ marginTop: "1rem" }}>
              <MerchantRegisterForm />
            </div>
            <p className="auth-link" style={{ marginTop: "1rem" }}>
              Hai già un account? <Link href="/login">Accedi</Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}
