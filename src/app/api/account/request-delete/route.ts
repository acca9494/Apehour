import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendTransactionalEmail, emailShell, escapeHtml } from "@/lib/email/send";

// Il commerciante non elimina il proprio account da solo: la richiesta
// viene registrata sul locale e notificata al team via email, che contatta
// il locale per capire il motivo prima di procedere (da /admin).
export async function POST(request: Request) {
  const server = await createServerClient();
  const { data: { user }, error: authErr } = await server.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === "string" ? body.reason.slice(0, 2000) : "";

  const { data: restaurant, error: restErr } = await server
    .from("restaurants")
    .update({ deletion_requested_at: new Date().toISOString(), deletion_reason: reason || null })
    .eq("owner_id", user.id)
    .select("id, name, email, phone")
    .maybeSingle();
  if (restErr || !restaurant) {
    return NextResponse.json({ error: restErr?.message ?? "Nessun locale associato a questo account." }, { status: 400 });
  }

  await sendTransactionalEmail({
    to: "aleacca94@gmail.com",
    subject: `Richiesta cancellazione account — ${restaurant.name}`,
    html: emailShell({
      heading: "Richiesta di cancellazione account",
      bodyHtml: `
        <p style="margin:0 0 12px; font-size:15px; line-height:1.6; color:#49473D;">
          <strong>${escapeHtml(restaurant.name)}</strong> ha richiesto di eliminare il proprio account commerciante.
        </p>
        <p style="margin:0 0 12px; font-size:15px; line-height:1.6; color:#49473D;">
          Contatti: ${restaurant.email ? escapeHtml(restaurant.email) : "—"}${restaurant.phone ? ` · ${escapeHtml(restaurant.phone)}` : ""}
        </p>
        <p style="margin:0; font-size:15px; line-height:1.6; color:#49473D;">
          Motivo indicato: ${reason ? escapeHtml(reason) : "— nessuno —"}
        </p>
        <p style="margin:16px 0 0; font-size:15px; line-height:1.6; color:#49473D;">
          Vai su /admin per contattarlo e decidere come procedere.
        </p>
      `,
    }),
  });

  return NextResponse.json({ ok: true });
}
