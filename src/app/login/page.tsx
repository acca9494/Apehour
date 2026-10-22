"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayButton } from "@/components/ui/clay-button";
import type { AuthErrorCode } from "@/lib/auth/types";
import { useLang } from "@/lib/i18n/context";

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const { t } = useLang();
  const a = t.auth;
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
        <p className="eyebrow">{a.welcomeBack}</p>
        <h1>{a.login}</h1>
        <p>{a.loginSub}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" role="alert">
              {a.errors[error] ?? a.errors.unknown}
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

          <label>
            {a.password}
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
            {submitting ? a.loggingIn : a.login}
          </ClayButton>
        </form>

        <p className="auth-link">
          <Link href="/forgot-password">{a.forgotPassword}</Link>
        </p>

        <p className="auth-link">
          {a.noAccount}{" "}
          <Link href="/register">{a.registerFree}</Link>
        </p>
      </div>
    </div>
  );
}
