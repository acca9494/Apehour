"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { VerifyButton } from "@/components/admin/verify-button";

interface RestaurantAdminRow {
  id: string;
  name: string;
  city: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  org_type: "locale" | "associazione";
  pickup_enabled: boolean;
  created_at: string;
}

function PickupToggle({ restaurantId, pickupEnabled }: { restaurantId: string; pickupEnabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle(checked: boolean) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/set-pickup-enabled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, pickupEnabled: checked }),
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
    <label onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={pickupEnabled}
        disabled={loading}
        onChange={(e) => toggle(e.target.checked)}
      />
      <span className="admin-row-sub">{pickupEnabled ? "Attivo" : "Spento"}</span>
    </label>
  );
}

function OrgTypeSelect({ restaurantId, orgType }: { restaurantId: string; orgType: "locale" | "associazione" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function change(value: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/set-org-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, orgType: value }),
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
    <select
      value={orgType}
      disabled={loading}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => change(e.target.value)}
      className="admin-org-select"
    >
      <option value="locale">Locale</option>
      <option value="associazione">Associazione</option>
    </select>
  );
}

interface RestaurantDetail {
  id: string;
  name: string;
  description: string | null;
  cuisine: string;
  tags: string[] | null;
  address: string | null;
  neighborhood: string | null;
  city: string;
  country: string;
  phone: string | null;
  website: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  legal_name: string | null;
  vat_number: string | null;
  pec: string | null;
  sdi_code: string | null;
  opening_hours: { day: string; hours: string }[] | null;
  price_range: string;
  max_party_size: number;
  max_capacity: number | null;
  menu_url: string | null;
  cancellation_policy: string | null;
  payment_methods: string[] | null;
  accessibility_tags: string[] | null;
  cover_image_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface ImageRow {
  url: string;
  is_cover: boolean;
  position: number;
}

export function RestaurantPreviewRow({ row, hasSchedule }: { row: RestaurantAdminRow; hasSchedule: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<RestaurantDetail | null>(null);
  const [images, setImages] = useState<ImageRow[]>([]);

  async function openPreview() {
    setOpen(true);
    if (detail) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/restaurant-detail?id=${row.id}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data.restaurant);
        setImages(data.images ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <tr className="admin-table__row" onClick={openPreview}>
        <td>
          <strong>{row.name}</strong>
          <div className="admin-row-sub">{row.city}{row.address ? ` · ${row.address}` : ""}</div>
        </td>
        <td>
          {row.email && <div>{row.email}</div>}
          {row.phone && <div className="admin-row-sub">{row.phone}</div>}
          {!row.email && !row.phone && <span className="admin-row-sub">—</span>}
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <OrgTypeSelect restaurantId={row.id} orgType={row.org_type} />
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          {row.org_type === "associazione" ? (
            <span className="admin-row-sub">—</span>
          ) : (
            <PickupToggle restaurantId={row.id} pickupEnabled={row.pickup_enabled} />
          )}
        </td>
        <td>
          {row.org_type === "associazione" ? (
            <span className="admin-row-sub">—</span>
          ) : hasSchedule ? (
            <span className="admin-badge admin-badge--ok">✓ Orari impostati</span>
          ) : (
            <span className="admin-badge admin-badge--warn">⚠️ Nessun orario</span>
          )}
        </td>
        <td>{row.is_active ? "Attivo" : "Disattivato"}</td>
        <td onClick={(e) => e.stopPropagation()}>
          <VerifyButton restaurantId={row.id} verified={row.is_verified} />
        </td>
      </tr>

      <Modal open={open} onClose={() => { setOpen(false); setDetail(null); }} title={row.name} wide>
        {loading && <p className="admin-empty">Caricamento…</p>}
        {!loading && detail && (
          <div className="admin-preview">
            {detail.cover_image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={detail.cover_image_url} alt={detail.name} className="admin-preview__cover" />
            )}
            {images.length > 0 && (
              <div className="admin-preview__gallery">
                {images.map((img) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={img.url} src={img.url} alt="" className="admin-preview__thumb" />
                ))}
              </div>
            )}

            <div className="admin-preview__grid">
              <div>
                <h3>Descrizione</h3>
                <p>{detail.description || "— nessuna descrizione —"}</p>
                <p className="admin-row-sub">
                  {detail.cuisine} · {detail.price_range} · max {detail.max_party_size} persone per tavolo
                  {detail.max_capacity ? ` · ${detail.max_capacity} coperti max` : ""}
                </p>
              </div>
              <div>
                <h3>Indirizzo</h3>
                <p>{detail.address || "—"}{detail.neighborhood ? `, ${detail.neighborhood}` : ""}<br />{detail.city}, {detail.country}</p>
              </div>
              <div>
                <h3>Contatti</h3>
                <p>
                  {detail.email && <>{detail.email}<br /></>}
                  {detail.phone && <>{detail.phone}<br /></>}
                  {detail.website && <>{detail.website}<br /></>}
                  {detail.instagram && <>@{detail.instagram}<br /></>}
                  {detail.facebook && <>{detail.facebook}</>}
                  {!detail.email && !detail.phone && !detail.website && !detail.instagram && !detail.facebook && "—"}
                </p>
              </div>
              <div>
                <h3>Dati fiscali</h3>
                <p>
                  {detail.legal_name && <>{detail.legal_name}<br /></>}
                  {detail.vat_number ? `P.IVA ${detail.vat_number}` : "— non inseriti —"}<br />
                  {detail.pec && <>PEC: {detail.pec}<br /></>}
                  {detail.sdi_code && <>SDI: {detail.sdi_code}</>}
                </p>
              </div>
              {detail.opening_hours && detail.opening_hours.length > 0 && (
                <div>
                  <h3>Orari di apertura</h3>
                  {detail.opening_hours.map((o, i) => <p key={i}>{o.day}: {o.hours}</p>)}
                </div>
              )}
              {detail.menu_url && (
                <div>
                  <h3>Menu</h3>
                  <p><a href={detail.menu_url} target="_blank" rel="noopener noreferrer">{detail.menu_url}</a></p>
                </div>
              )}
              {detail.cancellation_policy && (
                <div>
                  <h3>Politica di cancellazione</h3>
                  <p>{detail.cancellation_policy}</p>
                </div>
              )}
              {detail.payment_methods && detail.payment_methods.length > 0 && (
                <div>
                  <h3>Pagamenti accettati</h3>
                  <p>{detail.payment_methods.join(", ")}</p>
                </div>
              )}
              {detail.accessibility_tags && detail.accessibility_tags.length > 0 && (
                <div>
                  <h3>Accessibilità</h3>
                  <p>{detail.accessibility_tags.join(", ")}</p>
                </div>
              )}
            </div>

            <div className="admin-preview__footer">
              {row.org_type === "associazione" ? (
                <span className="admin-row-sub">Associazione — niente prenotazioni/orari</span>
              ) : hasSchedule ? (
                <span className="admin-badge admin-badge--ok">✓ Ha impostato gli orari prenotabili</span>
              ) : (
                <span className="admin-badge admin-badge--warn">⚠️ Non ha ancora impostato orari prenotabili</span>
              )}
              <VerifyButton restaurantId={detail.id} verified={detail.is_verified} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
