"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getMyProfile, updateMyProfile, type MyProfile } from "@/lib/auth/profile";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { DangerZoneDeleteAccount } from "@/components/ui/danger-zone-delete-account";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMyProfile(user.id).then((p) => { setProfile(p); setLoading(false); });
  }, [user]);

  function patch<K extends keyof MyProfile>(key: K, value: MyProfile[K]) {
    setProfile((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  }

  async function handleSave() {
    if (!profile || !user) return;
    setSaving(true);
    await updateMyProfile(user.id, profile);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!user || loading || !profile) return <div className="dash-loading">Caricamento…</div>;

  return (
    <div className="venue-settings">
      <div className="dashboard-page-header">
        <p className="eyebrow">Impostazioni</p>
        <h1>Il tuo profilo</h1>
        <p>Gestisci le informazioni del tuo account.</p>
      </div>

      <div className="dash-table-card settings-section">
        <h3>Informazioni personali</h3>

        <div className="settings-form">
          <div className="settings-form__full">
            <ImageUploadField
              label="Foto profilo"
              value={profile.avatarUrl}
              onChange={(dataUrl) => patch("avatarUrl", dataUrl)}
            />
          </div>

          <label>
            Nome
            <input
              type="text"
              value={profile.name}
              onChange={(e) => patch("name", e.target.value)}
            />
          </label>

          <label>
            Telefono
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => patch("phone", e.target.value)}
              placeholder="+39 …"
            />
          </label>

          <label>
            Data di nascita <span style={{ fontWeight: 400, textTransform: "none" }}>(facoltativa)</span>
            <input
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => patch("dateOfBirth", e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="settings-save-bar">
        <button
          type="button"
          className={`clay-button clay-button--primary${saving ? " is-loading" : ""}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Salvataggio…" : saved ? "✓ Salvato" : "Salva modifiche"}
        </button>
        {saved && <span className="settings-saved-msg">Modifiche salvate con successo.</span>}
      </div>

      <div style={{ marginTop: "2.5rem" }}>
        <DangerZoneDeleteAccount />
      </div>
    </div>
  );
}
