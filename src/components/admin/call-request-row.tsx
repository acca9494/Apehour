"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CallRequest {
  id: string;
  created_at: string;
  contact_name: string;
  email: string;
  phone: string;
  venue_name: string;
  address: string | null;
  city: string | null;
  avg_spend: string | null;
  slot_date: string;
  slot_time: string;
  event_source: string | null;
  status: string;
}

const STATUS_LABEL: Record<string, string> = {
  new: "Da contattare",
  contacted: "Contattato",
  done: "Chiusa",
};

export function CallRequestRow({ row }: { row: CallRequest }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function setStatus(status: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/set-call-request-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: row.id, status }),
      });
      if (!res.ok) { alert("Operazione fallita. Riprova."); return; }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const slotDateLabel = new Date(`${row.slot_date}T00:00:00`).toLocaleDateString("it-IT", {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <tr className="admin-table__row">
      <td>
        <strong>{row.venue_name}</strong>
        <div className="admin-row-sub">{[row.address, row.city].filter(Boolean).join(", ") || "— indirizzo non indicato —"}</div>
        {row.avg_spend && <div className="admin-row-sub">Conto medio: {row.avg_spend}</div>}
      </td>
      <td>
        <div>{row.contact_name}</div>
        <div className="admin-row-sub">{row.email}</div>
        <div className="admin-row-sub">{row.phone}</div>
        <a href={`mailto:${row.email}`} className="clay-button clay-button--secondary" style={{ marginTop: "0.4rem", display: "inline-block" }}>Contatta</a>
      </td>
      <td>
        <strong style={{ textTransform: "capitalize" }}>{slotDateLabel}</strong>
        <div className="admin-row-sub">alle {row.slot_time}</div>
        <div className="admin-row-sub">Richiesta il {new Date(row.created_at).toLocaleDateString("it-IT")}</div>
      </td>
      <td>{row.event_source || "—"}</td>
      <td>
        <span className={`admin-status-pill admin-status-pill--${row.status}`}>{STATUS_LABEL[row.status] ?? row.status}</span>
      </td>
      <td>
        {row.status !== "contacted" && (
          <button type="button" className="clay-button clay-button--secondary" disabled={loading} onClick={() => setStatus("contacted")}>
            Segna contattato
          </button>
        )}
        {row.status !== "done" && (
          <button type="button" className="clay-button clay-button--secondary" disabled={loading} onClick={() => setStatus("done")} style={{ marginTop: "0.4rem" }}>
            Chiudi
          </button>
        )}
      </td>
    </tr>
  );
}
