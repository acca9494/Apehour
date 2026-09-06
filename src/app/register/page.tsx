"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayButton } from "@/components/ui/clay-button";
import { MerchantRegisterForm } from "@/components/home/merchant-register-form";
import { Modal } from "@/components/ui/modal";
import { LegalModal } from "@/components/legal/legal-modal";
import type { AuthErrorCode } from "@/lib/auth/types";

const ERROR_MESSAGES: Record<Exclude<AuthErrorCode, "email_confirmation_required">, string> = {
  invalid_credentials: "Credenziali non valide.",
  email_taken: "Email già registrata. Prova ad accedere.",
  unknown: "Qualcosa è andato storto. Riprova.",
};

type Mode = "cliente" | "commerciante";

function initialModeFrom(param: string | null): Mode {
  if (param === "locale" || param === "commerciante") return "commerciante";
  return "cliente";
}

export default function RegisterPage() {
  const { register, loading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>(() => initialModeFrom(searchParams.get("mode")));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Exclude<AuthErrorCode, "email_confirmation_required"> | null>(null);
  const [showLegal, setShowLegal] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);

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
      if (code === "email_confirmation_required") {
        setShowConfirmEmail(true);
      } else {
        setError(code as Exclude<AuthErrorCode, "email_confirmation_required">);
      }
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
            Account personale
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

              <label className="mreg__checkbox">
                <input type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} required />
                <span>
                  Accetto l&apos;{" "}
                  <button type="button" className="mreg__privacy-link" onClick={() => setShowLegal(true)}>
                    informativa sulla privacy
                  </button>
                  {" "}di ApeHour
                </span>
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

      <Modal open={showConfirmEmail} onClose={() => setShowConfirmEmail(false)} title="Account creato">
        <div className="confirm-email-modal">
          <div className="confirm-email-modal__icon" aria-hidden="true">✓</div>
          <p>
            Il tuo account è stato creato. Controlla la tua email e clicca sul link di conferma
            prima di accedere.
          </p>
          <button type="button" className="mreg__btn mreg__btn--primary" onClick={() => setShowConfirmEmail(false)}>
            Ho capito
          </button>
        </div>
      </Modal>

      <LegalModal open={showLegal} onClose={() => setShowLegal(false)} />
    </div>
  );
}
