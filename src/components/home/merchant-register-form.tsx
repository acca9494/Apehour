"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayButton } from "@/components/ui/clay-button";
import { saveVenueSettings } from "@/lib/merchant/store";
import type { AuthErrorCode } from "@/lib/auth/types";

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: "Credenziali non valide.",
  email_taken: "Email già registrata. Prova ad accedere.",
  unknown: "Qualcosa è andato storto. Riprova.",
};

const CITIES = ["Milano", "Roma", "Firenze", "Torino", "Napoli", "Bologna", "Venezia", "Genova", "Palermo", "Bari", "Altra città"];

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

export function MerchantRegisterForm() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [venueName, setVenueName] = useState("");
  const [city, setCity]           = useState("");
  const [address, setAddress]     = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await register({ name: venueName, email, password, role: "commerciante" });
      saveVenueSettings({
        restaurantId: `rst-${session.user.id}`,
        name: venueName,
        description: "",
        address: address || "",
        city: city || "Milano",
        phone: "",
        email,
        website: "",
        instagram: "",
        heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
        deposit: { required: false, amount: 5, perPerson: true, policy: "La caparra viene trattenuta in caso di no-show senza preavviso." },
      }, session.user.id);
      setDone(true);
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
      await loginWithGoogle("commerciante");
      router.replace("/dashboard");
    } catch {
      setError("unknown");
      setGoogleLoading(false);
    }
  }

  if (done) {
    return (
      <div className="merchant-form-success">
        <p className="merchant-form-success__icon">🎉</p>
        <h3>Benvenuto su ApeHour!</h3>
        <p>Account creato per <strong>{venueName}</strong>. Vai alla dashboard per configurare il tuo locale.</p>
        <Link href="/dashboard" className="merchant-form-success__link">
          Vai alla dashboard →
        </Link>
      </div>
    );
  }

  return (
    <form className="merchant-form" onSubmit={handleSubmit}>
      {error && (
        <div className="auth-error" role="alert">
          {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown}
        </div>
      )}

      {/* Google button */}
      <button
        type="button"
        className="google-btn"
        onClick={handleGoogle}
        disabled={googleLoading || submitting}
      >
        <GoogleIcon />
        {googleLoading ? "Connessione…" : "Continua con Google"}
      </button>

      <div className="auth-divider"><span>oppure via email</span></div>

      <label className="merchant-form__field">
        <span>Nome del locale</span>
        <input
          type="text"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          placeholder="Bar Bello, Spritz Milano…"
          required
          autoComplete="organization"
        />
      </label>

      <div className="merchant-form__row">
        <label className="merchant-form__field">
          <span>Città</span>
          <select value={city} onChange={(e) => setCity(e.target.value)} required>
            <option value="" disabled>Seleziona…</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className="merchant-form__field">
          <span>Indirizzo <em>(opzionale)</em></span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Via Roma 10"
            autoComplete="street-address"
          />
        </label>
      </div>

      <label className="merchant-form__field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="la@tua-email.com"
          required
          autoComplete="email"
        />
      </label>

      <label className="merchant-form__field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="minimo 6 caratteri"
          required
          autoComplete="new-password"
          minLength={6}
        />
      </label>

      <ClayButton type="submit" className="merchant-form__submit" disabled={submitting || googleLoading}>
        {submitting ? "Creazione account…" : "Registra il tuo locale"}
      </ClayButton>

      <p className="merchant-form__note">
        Gratuito. Nessun contratto. Hai già un account?{" "}
        <Link href="/login">Accedi</Link>
      </p>
    </form>
  );
}
