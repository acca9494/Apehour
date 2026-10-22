"use client";

import { useState } from "react";
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
  created_at: string;
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
  legal_name: string | null;
  vat_number: string | null;
  opening_hours: { day: string; hours: string }[] | null;
  price_range: string;
  max_party_size: number;
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
        <td>
          {hasSchedule ? (
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
                <p className="admin-row-sub">{detail.cuisine} · {detail.price_range} · max {detail.max_party_size} persone</p>
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
                  {detail.instagram && <>@{detail.instagram}</>}
                  {!detail.email && !detail.phone && !detail.website && !detail.instagram && "—"}
                </p>
              </div>
              <div>
                <h3>Dati fiscali</h3>
                <p>
                  {detail.legal_name && <>{detail.legal_name}<br /></>}
                  {detail.vat_number ? `P.IVA ${detail.vat_number}` : "— non inseriti —"}
                </p>
              </div>
              {detail.opening_hours && detail.opening_hours.length > 0 && (
                <div>
                  <h3>Orari di apertura</h3>
                  {detail.opening_hours.map((o, i) => <p key={i}>{o.day}: {o.hours}</p>)}
                </div>
              )}
            </div>

            <div className="admin-preview__footer">
              {hasSchedule ? (
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
