import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Admin — Traffico" };

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(n: number) {
  return new Date(Date.now() - n * DAY_MS);
}

function isOwnDomain(url: string) {
  try {
    const host = new URL(url).hostname;
    return host.includes("apehour");
  } catch {
    return false;
  }
}

export default async function AdminTrafficPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return <div className="dashboard-page-header"><h1>Admin non configurato</h1><p>Manca SUPABASE_SERVICE_ROLE_KEY.</p></div>;
  }
  const service = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const since = daysAgo(90).toISOString();
  const { data: views, error } = await service
    .from("page_views")
    .select("path, referrer, session_id, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20000);

  if (error) {
    return (
      <div className="dashboard-page-header">
        <h1>Errore nel caricamento del traffico</h1>
        <p style={{ color: "#e04c4c" }}>{error.message}</p>
        <p>Controlla che la tabella page_views sia stata creata su Supabase.</p>
      </div>
    );
  }

  const { data: restaurants } = await service
    .from("restaurants")
    .select("id, name, slug, org_type")
    .eq("org_type", "locale")
    .order("name", { ascending: true });

  const rows = views ?? [];
  const now = Date.now();

  function windowRows(days: number) {
    const cutoff = now - days * DAY_MS;
    return rows.filter((r) => new Date(r.created_at).getTime() >= cutoff);
  }

  function uniqueSessions(list: typeof rows) {
    return new Set(list.map((r) => r.session_id)).size;
  }

  const today = windowRows(1);
  const last7 = windowRows(7);
  const last30 = windowRows(30);

  const pageCounts = new Map<string, number>();
  for (const r of last30) pageCounts.set(r.path, (pageCounts.get(r.path) ?? 0) + 1);
  const topPages = [...pageCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const referrerCounts = new Map<string, number>();
  for (const r of last30) {
    if (!r.referrer || isOwnDomain(r.referrer)) continue;
    let host: string;
    try { host = new URL(r.referrer).hostname; } catch { host = r.referrer; }
    referrerCounts.set(host, (referrerCounts.get(host) ?? 0) + 1);
  }
  const topReferrers = [...referrerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const dailyCounts: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = now - i * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const count = rows.filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    const label = new Date(dayStart).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
    dailyCounts.push({ label, count });
  }
  const maxDaily = Math.max(1, ...dailyCounts.map((d) => d.count));

  const venueStats = (restaurants ?? []).map((r) => {
    const path = `/restaurants/${r.slug}`;
    const v30 = last30.filter((row) => row.path === path).length;
    const v7 = last7.filter((row) => row.path === path).length;
    const vTotal = rows.filter((row) => row.path === path).length;
    return { ...r, v7, v30, vTotal };
  }).sort((a, b) => b.v30 - a.v30);

  return (
    <div className="dashboard-page-header admin-page">
      <p className="eyebrow">Admin</p>
      <h1>Traffico del sito</h1>
      <p>Statistiche anonime (nessun IP, nessun cookie persistente) sulle ultime visite. <Link href="/admin">← Torna alla verifica locali</Link></p>

      <div className="admin-kpi-row">
        <div className="dash-card admin-kpi"><span className="admin-kpi__value">{today.length}</span><span className="admin-kpi__label">Pagine viste oggi</span></div>
        <div className="dash-card admin-kpi"><span className="admin-kpi__value">{last7.length}</span><span className="admin-kpi__label">Pagine viste (7gg)</span></div>
        <div className="dash-card admin-kpi"><span className="admin-kpi__value">{last30.length}</span><span className="admin-kpi__label">Pagine viste (30gg)</span></div>
        <div className="dash-card admin-kpi"><span className="admin-kpi__value">{uniqueSessions(last7)}</span><span className="admin-kpi__label">Visite uniche (7gg)</span></div>
      </div>

      <h2 className="admin-section-title">Andamento ultimi 14 giorni</h2>
      <div className="dash-card admin-trend">
        {dailyCounts.map((d) => (
          <div key={d.label} className="admin-trend__col" title={`${d.label}: ${d.count}`}>
            <div className="admin-trend__bar" style={{ height: `${Math.max(4, (d.count / maxDaily) * 100)}%` }} />
            <span className="admin-trend__label">{d.label}</span>
          </div>
        ))}
      </div>

      <h2 className="admin-section-title">Traffico per locale</h2>
      {venueStats.length === 0 ? (
        <p className="admin-empty">Nessun locale verificato ancora.</p>
      ) : (
        <div className="dash-card" style={{ overflowX: "auto" }}>
          <table className="dash-table admin-table">
            <thead><tr><th>Locale</th><th>7 giorni</th><th>30 giorni</th><th>Totale (90gg)</th></tr></thead>
            <tbody>
              {venueStats.map((v) => (
                <tr key={v.id} className="admin-table__row">
                  <td><strong>{v.name}</strong></td>
                  <td>{v.v7}</td>
                  <td>{v.v30}</td>
                  <td>{v.vTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h2 className="admin-section-title">Pagine più viste (30gg)</h2>
          {topPages.length === 0 ? <p className="admin-empty">Nessun dato ancora.</p> : (
            <div className="dash-card">
              <table className="dash-table admin-table">
                <thead><tr><th>Pagina</th><th>Viste</th></tr></thead>
                <tbody>{topPages.map(([path, count]) => <tr key={path} className="admin-table__row"><td>{path}</td><td>{count}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
        <div style={{ flex: "1 1 320px" }}>
          <h2 className="admin-section-title">Provenienza (30gg)</h2>
          {topReferrers.length === 0 ? <p className="admin-empty">Nessuna provenienza esterna registrata.</p> : (
            <div className="dash-card">
              <table className="dash-table admin-table">
                <thead><tr><th>Sito di provenienza</th><th>Visite</th></tr></thead>
                <tbody>{topReferrers.map(([host, count]) => <tr key={host} className="admin-table__row"><td>{host}</td><td>{count}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
