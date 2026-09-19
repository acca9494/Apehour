"use client";

import { useEffect, useState } from "react";
import { fetchVenueSettings, updateVenueSettings } from "@/lib/merchant/service";
import type { VenueSettings } from "@/lib/merchant/store";
import { useAuth } from "@/lib/auth/context";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { DangerZoneDeleteAccount } from "@/components/ui/danger-zone-delete-account";

type Tab = "locale" | "contatti" | "fiscali";

export function VenueSettingsPanel() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<VenueSettings | null>(null);
  const [tab, setTab] = useState<Tab>("locale");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchVenueSettings(user.id).then((s) => { setSettings(s); setLoading(false); });
  }, [user]);

  async function handleSave() {
    if (!settings || !user) return;
    setSaving(true);
    await updateVenueSettings(settings, user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function patch<K extends keyof VenueSettings>(key: K, value: VenueSettings[K]) {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  }

  if (loading || !settings) return <div className="dash-loading">Caricamento impostazioni…</div>;

  return (
    <div className="venue-settings">
      <div className="dashboard-page-header">
        <p className="eyebrow">Impostazioni</p>
        <h1>Impostazioni locale</h1>
        <p>Gestisci le informazioni pubbliche e i contatti del tuo locale.</p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {(["locale", "contatti", "fiscali"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`settings-tab${tab === t ? " is-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "locale" ? "Locale" : t === "contatti" ? "Contatti" : "Dati fiscali"}
          </button>
        ))}
      </div>

      {/* ── Tab: Locale ── */}
      {tab === "locale" && (
        <div className="dash-table-card settings-section">
          <h3>Informazioni pubbliche</h3>
          <p className="settings-hint">Questi dati appaiono sulla pagina pubblica del locale.</p>

          <div className="settings-form">
            <label>
              Nome locale
              <input
                type="text"
                value={settings.name}
                onChange={(e) => patch("name", e.target.value)}
              />
            </label>

            <label className="settings-form__full">
              Descrizione
              <textarea
                rows={4}
                value={settings.description}
                onChange={(e) => patch("description", e.target.value)}
              />
            </label>

            <div className="settings-form__full">
              <ImageUploadField
                label="Immagine hero"
                value={settings.heroImage}
                onChange={(dataUrl) => patch("heroImage", dataUrl)}
              />
            </div>

            <label>
              Indirizzo
              <input
                type="text"
                value={settings.address}
                onChange={(e) => patch("address", e.target.value)}
              />
            </label>

            <label>
              Città
              <input
                type="text"
                value={settings.city}
                onChange={(e) => patch("city", e.target.value)}
              />
            </label>
          </div>

          <h3 style={{ marginTop: "2rem" }}>Orari di apertura</h3>
          <p className="settings-hint">Mostrati sulla pagina pubblica del locale (distinti dagli orari prenotabili).</p>
          <div className="settings-form">
            {settings.openingHours.map((row, i) => (
              <div key={i} className="settings-form__full" style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
                <label style={{ flex: 1 }}>
                  Giorni
                  <input
                    type="text"
                    value={row.day}
                    placeholder="Lun - Ven"
                    onChange={(e) => {
                      const next = [...settings.openingHours];
                      next[i] = { ...next[i]!, day: e.target.value };
                      patch("openingHours", next);
                    }}
                  />
                </label>
                <label style={{ flex: 1 }}>
                  Orario
                  <input
                    type="text"
                    value={row.hours}
                    placeholder="17:30 - 23:30"
                    onChange={(e) => {
                      const next = [...settings.openingHours];
                      next[i] = { ...next[i]!, hours: e.target.value };
                      patch("openingHours", next);
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="clay-button clay-button--secondary"
                  onClick={() => patch("openingHours", settings.openingHours.filter((_, idx) => idx !== i))}
                >
                  Rimuovi
                </button>
              </div>
            ))}
            <button
              type="button"
              className="clay-button clay-button--secondary settings-form__full"
              onClick={() => patch("openingHours", [...settings.openingHours, { day: "", hours: "" }])}
            >
              + Aggiungi riga orari
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Contatti ── */}
      {tab === "contatti" && (
        <div className="dash-table-card settings-section">
          <h3>Contatti e social</h3>
          <p className="settings-hint">Utilizzati per le notifiche e la pagina pubblica.</p>

          <div className="settings-form">
            <label>
              Telefono
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => patch("phone", e.target.value)}
                placeholder="+39 02 …"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={settings.email}
                onChange={(e) => patch("email", e.target.value)}
              />
            </label>

            <label>
              Sito web
              <input
                type="url"
                value={settings.website ?? ""}
                onChange={(e) => patch("website", e.target.value || undefined)}
                placeholder="https://…"
              />
            </label>

            <label>
              Instagram
              <input
                type="text"
                value={settings.instagram ?? ""}
                onChange={(e) => patch("instagram", e.target.value || undefined)}
                placeholder="@nomepagina"
              />
            </label>
          </div>
        </div>
      )}

      {/* ── Tab: Dati fiscali ── */}
      {tab === "fiscali" && (
        <div className="dash-table-card settings-section">
          <h3>Dati fiscali e legali</h3>
          <p className="settings-hint">Necessari per il contratto e la fatturazione. Non visibili pubblicamente.</p>

          <div className="settings-form">
            <label>
              Ragione sociale
              <input
                type="text"
                value={settings.legalName ?? ""}
                onChange={(e) => patch("legalName", e.target.value || undefined)}
                placeholder="Es. Brera Aperitivi S.r.l."
              />
            </label>

            <label>
              Partita IVA / Codice Fiscale
              <input
                type="text"
                value={settings.vatNumber ?? ""}
                onChange={(e) => patch("vatNumber", e.target.value || undefined)}
                placeholder="IT01234567890"
              />
            </label>

            <label className="settings-form__full">
              IBAN
              <input
                type="text"
                value={settings.iban ?? ""}
                onChange={(e) => patch("iban", e.target.value || undefined)}
                placeholder="IT60X0542811101000000123456"
              />
            </label>
          </div>
        </div>
      )}

      {/* Save bar */}
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
        <p className="settings-hint" style={{ color: "#e04c4c" }}>
          Attenzione: eliminando l&apos;account elimini anche il tuo locale e tutto ciò che contiene (tavoli, disponibilità, eventi, offerte).
        </p>
        <DangerZoneDeleteAccount />
      </div>
    </div>
  );
}
