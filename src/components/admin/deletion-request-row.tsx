"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeletionRequest {
  id: string;
  owner_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  deletion_requested_at: string;
  deletion_reason: string | null;
}

export function DeletionRequestRow({ row }: { row: DeletionRequest }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function dismiss() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dismiss-deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: row.id }),
      });
      if (!res.ok) { alert("Operazione fallita. Riprova."); return; }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className="admin-table__row">
      <td>
        <strong>{row.name}</strong>
        <div className="admin-row-sub">Richiesta il {new Date(row.deletion_requested_at).toLocaleDateString("it-IT")}</div>
      </td>
      <td>
        {row.email && <div>{row.email}</div>}
        {row.phone && <div className="admin-row-sub">{row.phone}</div>}
        {row.email && <a href={`mailto:${row.email}`} className="clay-button clay-button--secondary" style={{ marginTop: "0.4rem", display: "inline-block" }}>Contatta</a>}
      </td>
      <td>{row.deletion_reason || "— nessun motivo indicato —"}</td>
      <td>
        <button type="button" className="clay-button clay-button--secondary" disabled={loading} onClick={dismiss}>
          Annulla richiesta
        </button>
        <div className="admin-row-sub" style={{ marginTop: "0.4rem" }}>
          Per eliminare davvero l&apos;account, fallo da Supabase → Authentication (mai dal sito).
        </div>
      </td>
    </tr>
  );
}
