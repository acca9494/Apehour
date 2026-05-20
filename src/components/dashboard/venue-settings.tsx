"use client";

import { useEffect, useState } from "react";
import { fetchVenueSettings, updateVenueSettings } from "@/lib/merchant/service";
import type { VenueSettings } from "@/lib/merchant/store";
import { useAuth } from "@/lib/auth/context";

type Tab = "locale" | "caparra" | "contatti";

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

  function patchDeposit<K extends keyof VenueSettings["deposit"]>(
    key: K,
    value: VenueSettings["deposit"][K]
  ) {
    setSettings((prev) =>
      prev ? { ...prev, deposit: { ...prev.deposit, [key]: value } } : prev
    );
    setSaved(false);
  }

  if (loading || !settings) return <div className="dash-loading">Caricamento impostazioni…</div>;

  return (
    <div className="venue-settings">
      <div className="dashboard-page-header">
        <p className="eyebrow">Impostazioni</p>
        <h1>Impostazioni locale</h1>
        <p>Gestisci le informazioni pubbliche, la caparra e i contatti del tuo locale.</p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {(["locale", "caparra", "contatti"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`settings-tab${tab === t ? " is-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "locale" ? "Locale" : t === "caparra" ? "Caparra" : "Contatti"}
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

            <label className="settings-form__full">
              Immagine hero (URL)
              <input
                type="url"
                value={settings.heroImage}
                onChange={(e) => patch("heroImage", e.target.value)}
                placeholder="https://..."
              />
            </label>

            {settings.heroImage && (
              <div className="settings-hero-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.heroImage} alt="Hero preview" />
                <span>Anteprima immagine hero</span>
              </div>
            )}

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
        </div>
      )}

      {/* ── Tab: Caparra ── */}
      {tab === "caparra" && (
        <div className="dash-table-card settings-section">
          <h3>Impostazioni caparra</h3>
          <p className="settings-hint">La caparra viene mostrata chiaramente al cliente prima di confermare.</p>

          <div className="settings-deposit">
            <div className="settings-deposit__toggle-row">
              <div>
                <strong>Caparra obbligatoria</strong>
                <p>Se attiva, il cliente deve pagare la caparra per completare la prenotazione.</p>
              </div>
              <button
                type="button"
                className={`avail-toggle avail-toggle--large${settings.deposit.required ? " is-on" : ""}`}
                onClick={() => patchDeposit("required", !settings.deposit.required)}
                aria-pressed={settings.deposit.required}
              >
                <span />
              </button>
            </div>

            {settings.deposit.required && (
              <>
                <div className="settings-deposit__options">
                  <label>
                    Importo (€)
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={settings.deposit.amount}
                      onChange={(e) => patchDeposit("amount", Number(e.target.value))}
                    />
                  </label>
                  <div className="settings-deposit__type">
                    <span>Tipo caparra</span>
                    <div className="settings-radio-group">
                      <label>
                        <input
                          type="radio"
                          checked={settings.deposit.perPerson}
                          onChange={() => patchDeposit("perPerson", true)}
                        />
                        Per persona
                      </label>
                      <label>
                        <input
                          type="radio"
                          checked={!settings.deposit.perPerson}
                          onChange={() => patchDeposit("perPerson", false)}
                        />
                        Importo fisso
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-deposit__preview">
                  <span>Preview cliente:</span>
                  <strong>
                    Caparra {settings.deposit.perPerson ? `€${settings.deposit.amount} × persona` : `€${settings.deposit.amount} fisso`}
                  </strong>
                </div>

                <label className="settings-form__full">
                  Policy caparra (visibile al cliente)
                  <textarea
                    rows={3}
                    value={settings.deposit.policy}
                    onChange={(e) => patchDeposit("policy", e.target.value)}
                  />
                </label>
              </>
            )}

            {!settings.deposit.required && (
              <div className="settings-deposit__off-notice">
                ✓ Nessuna caparra richiesta. I clienti prenotano gratuitamente.
              </div>
            )}
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
    </div>
  );
}
