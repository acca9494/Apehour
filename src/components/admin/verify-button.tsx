"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerifyButton({ restaurantId, verified }: { restaurantId: string; verified: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, verified: !verified }),
      });
      if (!res.ok) {
        alert("Operazione fallita. Riprova.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`admin-verify-btn ${verified ? "admin-verify-btn--on" : "admin-verify-btn--off"}`}
    >
      {loading ? "…" : verified ? "✓ Verificato — rimuovi" : "Verifica locale"}
    </button>
  );
}
