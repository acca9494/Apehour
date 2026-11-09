"use client";

import { useEffect, useState } from "react";
import { fetchVenueSettings, updateVenueSettings } from "@/lib/merchant/service";
import type { VenueSettings } from "@/lib/merchant/store";
import { useAuth } from "@/lib/auth/context";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { DangerZoneDeleteAccount } from "@/components/ui/danger-zone-delete-account";
import { listGalleryImages, addGalleryImage, removeGalleryImage, type GalleryImage } from "@/lib/restaurants/gallery";

type Tab = "locale" | "contatti" | "fiscali";

// Stesso vocabolario del filtro "Caratteristiche" in ricerca
// (src/components/search/search-results-client.tsx CHARACTERISTIC_OPTIONS):
// il valore salvato qui deve combaciare con la keyword cercata là, altrimenti
// il locale non comparirà mai per quel filtro anche se la caratteristica c'è.
const TAG_OPTIONS = [
  { value: "pet",                  label: "Pet Friendly",         emoji: "🐾" },
  { value: "outdoor",              label: "Spazio all'aperto",    emoji: "🌿" },
  { value: "vista",                label: "Vista panoramica",     emoji: "🌇" },
  { value: "romantico",            label: "Romantico",            emoji: "💕" },
  { value: "gruppi",               label: "Ideale per gruppi",    emoji: "👥" },
  { value: "vini naturali",        label: "Vini naturali",        emoji: "🍇" },
  { value: "cocktail artigianali", label: "Cocktail artigianali", emoji: "🍸" },
];

// Stesso vocabolario del tipo Cuisine (src/lib/types.ts) — valori diversi
// qui non comparirebbero mai nel filtro categoria della ricerca.
const CUISINE_OPTIONS = [
  "Spritz Bar", "Wine Bar", "Cocktail Bar", "Vermouth Bar", "Cicchetti Bar",
  "Rooftop Bar", "Negroni Bar", "Champagne Bar", "Brunch", "Beer Bar", "Whisky Bar",
];

const PAYMENT_OPTIONS = [
  { value: "contanti", label: "Contanti" },
  { value: "carta",    label: "Carta" },
  { value: "satispay",  label: "Satispay" },
  { value: "bancomat", label: "Bancomat" },
];

const ACCESSIBILITY_OPTIONS = [
  { value: "accesso disabili", label: "Accesso disabili",   emoji: "♿" },
  { value: "parcheggio",       label: "Parcheggio",         emoji: "🅿️" },
  { value: "bike parking",     label: "Bike parking",       emoji: "🚲" },
  { value: "aria condizionata", label: "Aria condizionata", emoji: "❄️" },
  { value: "wifi",             label: "Wi-Fi",              emoji: "📶" },
];

export function VenueSettingsPanel() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<VenueSettings | null>(null);
  const [tab, setTab] = useState<Tab>("locale");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchVenueSettings(user.id).then((s) => {
      setSettings(s);
      setLoading(false);
      listGalleryImages(s.restaurantId).then(setGallery).catch(() => {});
    });
  }, [user]);

  async function handleAddGalleryImage(url: string) {
    if (!settings) return;
    setUploadingGallery(true);
    try {
      const img = await addGalleryImage(settings.restaurantId, url);
      setGallery((prev) => [...prev, img]);
    } catch {
      alert("Non è stato possibile aggiungere la foto. Riprova.");
    } finally {
      setUploadingGallery(false);
    }
  }

  async function handleRemoveGalleryImage(id: string) {
    const prev = gallery;
    setGallery((g) => g.filter((img) => img.id !== id));
    try {
      await removeGalleryImage(id);
    } catch {
      setGallery(prev);
      alert("Non è stato possibile rimuovere la foto. Riprova.");
    }
  }

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

            <div className="settings-form__full">
              <span className="auth-form__label" style={{ display: "block", marginBottom: "0.5rem" }}>
                Galleria foto
              </span>
              <p className="settings-hint" style={{ marginTop: 0 }}>
                Altre foto mostrate nella pagina pubblica del locale (oltre all&apos;immagine hero). Carica quelle che ti manda il locale.
              </p>
              <div className="settings-gallery">
                {gallery.map((img) => (
                  <div key={img.id} className="settings-gallery__item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" />
                    <button
                      type="button"
                      className="settings-gallery__remove"
                      onClick={() => handleRemoveGalleryImage(img.id)}
                      aria-label="Rimuovi foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="settings-gallery__add">
                  <ImageUploadField
                    label=""
                    value=""
                    onChange={handleAddGalleryImage}
                  />
                </div>
              </div>
              {uploadingGallery && <p className="settings-hint">Aggiunta foto…</p>}
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

            <label>
              Categoria
              <select
                value={settings.cuisine}
                onChange={(e) => patch("cuisine", e.target.value)}
              >
                {CUISINE_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label>
              Coperti massimi
              <input
                type="number"
                min={0}
                value={settings.maxCapacity ?? ""}
                onChange={(e) => patch("maxCapacity", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Es. 60"
              />
            </label>

            <label className="settings-form__full">
              Menu (link)
              <input
                type="url"
                value={settings.menuUrl ?? ""}
                onChange={(e) => patch("menuUrl", e.target.value || undefined)}
                placeholder="Link a PDF o pagina con la carta/menu"
              />
            </label>

            <label className="settings-form__full">
              Politica di cancellazione
              <textarea
                rows={3}
                value={settings.cancellationPolicy ?? ""}
                onChange={(e) => patch("cancellationPolicy", e.target.value || undefined)}
                placeholder="Es. Cancellazione gratuita fino a 2 ore prima."
              />
            </label>
          </div>

          <h3 style={{ marginTop: "2rem" }}>Metodi di pagamento accettati</h3>
          <div className="settings-tags">
            {PAYMENT_OPTIONS.map((opt) => (
              <label key={opt.value} className="settings-tags__item">
                <input
                  type="checkbox"
                  checked={settings.paymentMethods.includes(opt.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...settings.paymentMethods, opt.value]
                      : settings.paymentMethods.filter((p) => p !== opt.value);
                    patch("paymentMethods", next);
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>

          <h3 style={{ marginTop: "2rem" }}>Accessibilità</h3>
          <div className="settings-tags">
            {ACCESSIBILITY_OPTIONS.map((opt) => (
              <label key={opt.value} className="settings-tags__item">
                <input
                  type="checkbox"
                  checked={settings.accessibilityTags.includes(opt.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...settings.accessibilityTags, opt.value]
                      : settings.accessibilityTags.filter((a) => a !== opt.value);
                    patch("accessibilityTags", next);
                  }}
                />
                {opt.emoji} {opt.label}
              </label>
            ))}
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

          <h3 style={{ marginTop: "2rem" }}>Caratteristiche</h3>
          <p className="settings-hint">Usate dai clienti per filtrare la ricerca — senza queste, il tuo locale non comparirà mai se qualcuno le seleziona.</p>
          <div className="settings-tags">
            {TAG_OPTIONS.map((opt) => (
              <label key={opt.value} className="settings-tags__item">
                <input
                  type="checkbox"
                  checked={settings.tags.includes(opt.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...settings.tags, opt.value]
                      : settings.tags.filter((t) => t !== opt.value);
                    patch("tags", next);
                  }}
                />
                {opt.emoji} {opt.label}
              </label>
            ))}
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

            <label>
              Facebook
              <input
                type="text"
                value={settings.facebook ?? ""}
                onChange={(e) => patch("facebook", e.target.value || undefined)}
                placeholder="Link alla pagina Facebook"
              />
            </label>

            <label className="settings-form__full">
              Video del locale
              <input
                type="url"
                value={settings.videoUrl ?? ""}
                onChange={(e) => patch("videoUrl", e.target.value || undefined)}
                placeholder="Link YouTube, Instagram Reel, TikTok…"
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

            <label>
              PEC
              <input
                type="email"
                value={settings.pec ?? ""}
                onChange={(e) => patch("pec", e.target.value || undefined)}
                placeholder="nome@pec.it"
              />
            </label>

            <label>
              Codice SDI
              <input
                type="text"
                value={settings.sdiCode ?? ""}
                onChange={(e) => patch("sdiCode", e.target.value || undefined)}
                placeholder="Es. 0000000 o XXXXXXX per fattura PA"
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
