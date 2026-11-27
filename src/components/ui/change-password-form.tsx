"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Le due password non coincidono.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw new Error(updateErr.message);
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Non è stato possibile aggiornare la password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dash-table-card settings-section">
      <h3>Cambia password</h3>
      <p className="settings-hint">Sei già loggato: basta scegliere la nuova password, senza dover reinserire quella attuale.</p>

      <form className="settings-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <label>
          Nuova password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="minimo 8 caratteri"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          Conferma nuova password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="ripeti la password"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </label>
        <div className="settings-form__full">
          <button type="submit" className="clay-button clay-button--primary" disabled={saving}>
            {saving ? "Salvataggio…" : saved ? "✓ Password aggiornata" : "Aggiorna password"}
          </button>
        </div>
      </form>
    </div>
  );
}
