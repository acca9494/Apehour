"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

export function DangerZoneDeleteAccount() {
  const { logout } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Errore durante la cancellazione");
      await logout();
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore durante la cancellazione");
      setDeleting(false);
    }
  }

  return (
    <div className="dash-table-card settings-section" style={{ borderColor: "#e04c4c" }}>
      <h3 style={{ color: "#e04c4c" }}>Zona pericolosa</h3>
      <p className="settings-hint">
        Eliminare l&apos;account cancella definitivamente il tuo profilo, i preferiti e le recensioni. Le prenotazioni/biglietti già fatti restano nello storico del locale ma senza più i tuoi dati personali. Questa azione non è reversibile.
      </p>

      {!confirming ? (
        <button type="button" className="clay-button clay-button--secondary" onClick={() => setConfirming(true)}>
          Elimina account
        </button>
      ) : (
        <div className="settings-form" style={{ maxWidth: 420 }}>
          <label className="settings-form__full">
            Scrivi ELIMINA per confermare
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINA"
            />
          </label>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              className="clay-button clay-button--primary"
              style={{ background: "#e04c4c" }}
              disabled={confirmText !== "ELIMINA" || deleting}
              onClick={handleDelete}
            >
              {deleting ? "Eliminazione…" : "Conferma eliminazione"}
            </button>
            <button type="button" className="clay-button clay-button--secondary" onClick={() => { setConfirming(false); setConfirmText(""); }}>
              Annulla
            </button>
          </div>
          {error && <p style={{ color: "#e04c4c" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
