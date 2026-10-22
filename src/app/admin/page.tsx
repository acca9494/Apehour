import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";
import { RestaurantPreviewRow } from "@/components/admin/restaurant-preview-row";

export const metadata = { title: "Admin — Locali" };

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

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return <div className="dashboard-page-header"><h1>Admin non configurato</h1><p>Manca SUPABASE_SERVICE_ROLE_KEY.</p></div>;
  }
  const service = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: restaurants } = await service
    .from("restaurants")
    .select("id, name, city, address, email, phone, is_active, is_verified, created_at")
    .order("created_at", { ascending: false });

  const { data: schedules } = await service.from("availability_schedules").select("restaurant_id").eq("is_active", true);
  const hasSchedule = new Set((schedules ?? []).map((s) => s.restaurant_id as string));

  const rows = (restaurants ?? []) as RestaurantAdminRow[];
  const pending = rows.filter((r) => !r.is_verified);
  const verified = rows.filter((r) => r.is_verified);

  function renderRow(r: RestaurantAdminRow) {
    return <RestaurantPreviewRow key={r.id} row={r} hasSchedule={hasSchedule.has(r.id)} />;
  }

  return (
    <div className="dashboard-page-header admin-page">
      <p className="eyebrow">Admin</p>
      <h1>Verifica locali</h1>
      <p>Un locale diventa visibile ai clienti solo quando lo verifichi qui. {rows.length} locali totali, {pending.length} da verificare. Clicca su una riga per vedere i dettagli prima di approvare.</p>

      <h2 className="admin-section-title">Da verificare ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="admin-empty">Nessun locale in attesa.</p>
      ) : (
        <div className="dash-card" style={{ overflowX: "auto" }}>
          <table className="dash-table admin-table">
            <thead><tr><th>Locale</th><th>Contatti</th><th>Disponibilità</th><th>Stato</th><th></th></tr></thead>
            <tbody>{pending.map(renderRow)}</tbody>
          </table>
        </div>
      )}

      <h2 className="admin-section-title">Già verificati ({verified.length})</h2>
      {verified.length === 0 ? (
        <p className="admin-empty">Nessuno ancora.</p>
      ) : (
        <div className="dash-card" style={{ overflowX: "auto" }}>
          <table className="dash-table admin-table">
            <thead><tr><th>Locale</th><th>Contatti</th><th>Disponibilità</th><th>Stato</th><th></th></tr></thead>
            <tbody>{verified.map(renderRow)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
