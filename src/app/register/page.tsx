"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayButton } from "@/components/ui/clay-button";
import { MerchantRegisterForm } from "@/components/home/merchant-register-form";
import { Modal } from "@/components/ui/modal";
import { LegalModal } from "@/components/legal/legal-modal";
import type { AuthErrorCode } from "@/lib/auth/types";
import { useLang } from "@/lib/i18n/context";

type Mode = "cliente" | "commerciante";

function initialModeFrom(param: string | null): Mode {
  if (param === "locale" || param === "commerciante") return "commerciante";
  return "cliente";
}

export default function RegisterPage() {
  const { register, loading, user } = useAuth();
  const { t } = useLang();
  const a = t.auth;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>(() => initialModeFrom(searchParams.get("mode")));
  const evento = searchParams.get("evento");
  const holdRedirect = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Exclude<AuthErrorCode, "email_confirmation_required"> | null>(null);
  const [showLegal, setShowLegal] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);

  useEffect(() => {
    if (!loading && user && !holdRedirect.current) {
      router.replace(user.role === "commerciante" ? "/dashboard" : "/profile");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        name, email, password, role: "cliente",
        metadata: {
          privacy_accepted_at: new Date().toISOString(),
          ...(evento ? { event_source: evento } : {}),
        },
      });
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
            {a.personalAccount}
          </button>
          <button
            type="button"
            className={`reg-mode-toggle__btn ${mode === "commerciante" ? "is-active" : ""}`}
            onClick={() => { setMode("commerciante"); setError(null); }}
          >
            {a.haveVenue}
          </button>
        </div>

        {mode === "cliente" && (
          <>
            <p className="eyebrow" style={{ marginTop: "1rem" }}>{a.createAccount}</p>
            <h1>{a.register}</h1>
            <p>{a.registerSub}</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && (
                <div className="auth-error" role="alert">
                  {a.errors[error] ?? a.errors.unknown}
                </div>
              )}

              <label>
                {a.fullName}
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Mario Rossi" required autoComplete="name" />
              </label>

              <label>
                {a.email}
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="la@tua-email.com" required autoComplete="email" />
              </label>

              <label>
                {a.password}
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="minimo 8 caratteri" required autoComplete="new-password" minLength={8} />
              </label>

              <label className="mreg__checkbox">
                <input type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} required />
                <span>
                  {a.privacyAccept}
                  <button type="button" className="mreg__privacy-link" onClick={() => setShowLegal(true)}>
                    {a.privacyPolicy}
                  </button>
                  {" "}{a.privacyOf}
                </span>
              </label>

              <ClayButton type="submit" className="auth-form__submit" disabled={submitting}>
                {submitting ? a.creatingAccount : a.createAccount}
              </ClayButton>
            </form>

            <p className="auth-link">
              {a.alreadyAccount} <Link href="/login">{a.login}</Link>
            </p>
          </>
        )}

        {mode === "commerciante" && (
          <>
            <p className="eyebrow" style={{ marginTop: "1rem" }}>Registra il tuo locale</p>
            <h1>Per i locali</h1>
            <p>Gratis per i primi 30 giorni. Nessun contratto.</p>
            <div style={{ marginTop: "1rem" }}>
              <MerchantRegisterForm eventSource={evento} onAccountCreating={() => { holdRedirect.current = true; }} />
            </div>
            <p className="auth-link" style={{ marginTop: "1rem" }}>
              Hai già un account? <Link href="/login">Accedi</Link>
            </p>
          </>
        )}

      </div>

      <Modal open={showConfirmEmail} onClose={() => setShowConfirmEmail(false)} title={a.accountCreated}>
        <div className="confirm-email-modal">
          <div className="confirm-email-modal__icon" aria-hidden="true">✓</div>
          <p>
            {a.accountCreatedNote}
          </p>
          <button type="button" className="mreg__btn mreg__btn--primary" onClick={() => setShowConfirmEmail(false)}>
            {a.gotIt}
          </button>
        </div>
      </Modal>

      <LegalModal open={showLegal} onClose={() => setShowLegal(false)} />
    </div>
  );
}
