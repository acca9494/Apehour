"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getVenueSettings } from "@/lib/merchant/store";
import { restaurants } from "@/lib/data/restaurants";
import { slugify, todayInputValue } from "@/lib/utils";
import { CalendarDropdown } from "@/components/ui/calendar-dropdown";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import {
  getMerchantEvents,
  upsertMerchantEvent,
  deleteMerchantEvent,
  type MerchantEvent,
} from "@/lib/events/merchant-events-store";
import { getParticipantsForEvent } from "@/lib/tickets/store";

const CATEGORIES = [
  "Festival", "Musica Live", "DJ Set", "Degustazione", "Speciale", "Cocktail",
  "Aperitivo", "Karaoke", "Quiz Night", "Silent Disco", "Stand-up Comedy", "Vinyl Night", "Workshop",
];

function emptyEvent(restaurantSlug: string, restaurantName: string): MerchantEvent {
  return {
    id: `mev-${Date.now()}`,
    slug: "",
    title: "",
    date: "",
    location: "",
    image: "",
    category: CATEGORIES[0]!,
    price: "",
    bees: 20,
    description: "",
    restaurantSlug,
    restaurantName,
  };
}

export function EventsManager() {
  const { user } = useAuth();
  const [events, setEvents] = useState<MerchantEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MerchantEvent | null>(null);
  const [isFree, setIsFree] = useState(false);
  const [priceValue, setPriceValue] = useState("");
  const [eventDate, setEventDate] = useState(todayInputValue());
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventTime, setEventTime] = useState("18:00");

  const restaurantId = user ? getVenueSettings(user.id).restaurantId : null;
  const restaurant = restaurants.find((r) => r.id === restaurantId);

  useEffect(() => {
    if (!user) return;
    setEvents(getMerchantEvents(user.id));
    setLoading(false);
  }, [user]);

  function openNew() {
    if (!restaurant) return;
    setEditing(emptyEvent(restaurant.slug, restaurant.name));
    setIsFree(false);
    setPriceValue("");
    setEventDate(todayInputValue());
    setEventEndDate("");
    setEventTime("18:00");
  }

  function openEdit(e: MerchantEvent) {
    setEditing(e);
    setIsFree(/free/i.test(e.price));
    setPriceValue(/free/i.test(e.price) ? "" : e.price.replace(/[^\d.,]/g, ""));
    setEventDate(todayInputValue());
    setEventEndDate("");
    setEventTime("18:00");
  }

  function formatDayLabel(iso: string, withMonth = true) {
    const opts: Intl.DateTimeFormatOptions = withMonth
      ? { weekday: "short", day: "numeric", month: "short" }
      : { day: "numeric" };
    const label = new Date(iso + "T00:00:00").toLocaleDateString("it-IT", opts);
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !editing || !editing.title.trim() || !eventDate || !editing.image) return;
    const slug = editing.slug || slugify(editing.title);
    const price = isFree ? "Free entry" : `da €${priceValue || "0"}`;
    const isRange = eventEndDate && eventEndDate !== eventDate;
    const dateRange = isRange
      ? `Dal ${formatDayLabel(eventDate, false)} al ${formatDayLabel(eventEndDate)}`
      : formatDayLabel(eventDate);
    const date = `${dateRange} · ${eventTime}`;
    const toSave: MerchantEvent = { ...editing, slug, price, date };
    upsertMerchantEvent(toSave, user.id);
    setEvents(getMerchantEvents(user.id));
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!user) return;
    if (!confirm("Eliminare questo evento?")) return;
    deleteMerchantEvent(id, user.id);
    setEvents(getMerchantEvents(user.id));
  }

  if (loading) {
    return <div className="dash-loading">Caricamento eventi…</div>;
  }

  return (
    <div className="avail-manager">
      <div className="dashboard-page-header">
        <p className="eyebrow">Eventi</p>
        <h1>Crea i tuoi eventi</h1>
        <p>Pubblica un evento con tutti i dettagli: apparirà nella pagina Eventi del sito.</p>
      </div>

      <div className="avail-summary-bar">
        <div className="avail-summary-item">
          <strong>{events.length}</strong>
          <span>Eventi pubblicati</span>
        </div>
        <button type="button" className="clay-button clay-button--primary avail-save-btn" onClick={openNew}>
          + Nuovo evento
        </button>
      </div>

      {editing && (
        <div className="dash-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>{events.some((e) => e.id === editing.id) ? "Modifica evento" : "Nuovo evento"}</h3>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "0.9rem", maxWidth: 520 }}>
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Titolo evento
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Es. Sunset Jazz & Spritz"
                required
              />
            </label>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <span className="auth-form__label" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Data <span style={{ fontWeight: 400, textTransform: "none" }}>(clicca due giorni per un intervallo)</span>
                </span>
                <CalendarDropdown
                  compact
                  value={eventDate}
                  onChange={setEventDate}
                  rangeEnd={eventEndDate}
                  onRangeEndChange={setEventEndDate}
                />
              </div>
              <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Ora
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} required />
              </label>
            </div>
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Luogo
              <input
                value={editing.location}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                placeholder="Es. Milano, Navigli"
                required
              />
            </label>
            <ImageUploadField
              label="Immagine evento"
              value={editing.image}
              onChange={(dataUrl) => setEditing({ ...editing, image: dataUrl })}
            />
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Categoria
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Descrizione
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={3}
                placeholder="Racconta l'evento in poche righe…"
                required
              />
            </label>

            <div>
              <span className="auth-form__label" style={{ display: "block", marginBottom: "0.5rem" }}>Prezzo biglietto</span>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <button
                  type="button"
                  className={`avail-toggle${isFree ? " is-on" : ""}`}
                  onClick={() => setIsFree((v) => !v)}
                  aria-label="Ingresso gratuito"
                >
                  <span />
                </button>
                <span style={{ fontSize: "0.85rem" }}>Free entry</span>
                {!isFree && (
                  <input
                    type="number"
                    min={0}
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder="Prezzo €"
                    style={{ maxWidth: 120 }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button type="submit" className="mreg__btn mreg__btn--primary">Salva evento</button>
              <button type="button" className="booking3-back" onClick={() => setEditing(null)}>Annulla</button>
            </div>
          </form>
        </div>
      )}

      <div className="dash-table-card">
        {events.length === 0 ? (
          <div className="dash-empty">
            <p>Nessun evento creato finora.</p>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Data</th>
                <th>Categoria</th>
                <th>Prezzo</th>
                <th>Partecipanti</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td><span className="dash-table__name">{e.title}</span></td>
                  <td className="dash-table__muted">{e.date}</td>
                  <td className="dash-table__muted">{e.category}</td>
                  <td className="dash-table__muted">{e.price}</td>
                  <td className="dash-table__center">{getParticipantsForEvent(e.slug)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <button type="button" className="mbk-action-btn" onClick={() => openEdit(e)}>Modifica</button>
                      <button type="button" className="dash-action-btn dash-action-btn--reject" onClick={() => handleDelete(e.id)}>Elimina</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
