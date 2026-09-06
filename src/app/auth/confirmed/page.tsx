"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayLink } from "@/components/ui/clay-button";

export default function EmailConfirmedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading || !user || redirecting) return;
    setRedirecting(true);
    const dest = user.role === "commerciante" ? "/dashboard" : "/profile";
    const t = setTimeout(() => router.replace(dest), 2200);
    return () => clearTimeout(t);
  }, [user, loading, redirecting, router]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="confirm-email-modal__icon" aria-hidden="true" style={{ margin: "0 auto 1rem" }}>✓</div>
        <p className="eyebrow">Fatto</p>
        <h1>Email confermata!</h1>
        {loading ? (
          <p>Un attimo…</p>
        ) : user ? (
          <p>Ti stiamo portando alla tua dashboard…</p>
        ) : (
          <>
            <p>Il tuo account è confermato. Ora puoi accedere.</p>
            <div style={{ marginTop: "1.25rem" }}>
              <ClayLink href="/login">Accedi</ClayLink>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
