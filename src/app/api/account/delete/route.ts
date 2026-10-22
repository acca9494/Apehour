import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendTransactionalEmail, emailShell } from "@/lib/email/send";

// Cancellazione account (diritto all'oblio, GDPR). Richiede la service role
// key: solo il server può eliminare un utente da auth.users, mai il client.
//
// Prima di eliminare, anonimizza i dati personali sullo storico prenotazioni/
// biglietti (nome/email/telefono) invece di bloccarne la cancellazione: quei
// record restano nello storico del locale come dato aggregato/di gestione,
// ma senza più informazioni identificative del cliente. Il profilo e tutto
// ciò che referenzia direttamente l'utente (preferiti, recensioni, eventuale
// locale di proprietà) viene invece eliminato in cascata dal database.
export async function POST() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Account deletion not configured" }, { status: 503 });
  }

  const server = await createServerClient();
  const { data: { user }, error: authErr } = await server.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const anonymized = {
    customer_name: "Utente eliminato",
    customer_email: "eliminato@apehour.local",
    customer_phone: null,
    special_requests: null,
  };
  const { error: bookingsErr } = await admin.from("bookings").update(anonymized).eq("customer_id", user.id);
  if (bookingsErr) {
    return NextResponse.json({ error: "Impossibile anonimizzare le prenotazioni: " + bookingsErr.message }, { status: 500 });
  }

  const { error: ticketsErr } = await admin
    .from("ticket_requests")
    .update({ buyer_name: "Utente eliminato", buyer_email: "eliminato@apehour.local", buyer_phone: null })
    .eq("customer_id", user.id);
  if (ticketsErr) {
    return NextResponse.json({ error: "Impossibile anonimizzare i biglietti: " + ticketsErr.message }, { status: 500 });
  }

  const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);
  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  // Mandata DOPO che la cancellazione è andata davvero a buon fine (l'indirizzo
  // era già stato letto sopra, prima di cancellare l'utente — Resend non ha
  // bisogno che l'account esista ancora). Un fallimento dell'invio non deve
  // far fallire la risposta: l'account è comunque stato eliminato.
  if (user.email) {
    await sendTransactionalEmail({
      to: user.email,
      subject: "Il tuo account ApeHour è stato eliminato",
      html: emailShell({
        heading: "Account eliminato",
        bodyHtml: `<p style="margin:0; font-size:15px; line-height:1.6; color:#49473D;">
          Confermiamo che il tuo account ApeHour e i tuoi dati personali sono stati eliminati, come richiesto.
          Lo storico delle prenotazioni resta presso i locali in forma anonima, senza più nessun dato che ti identifichi.
          Se non sei stato tu a richiederlo, scrivici subito a <a href="mailto:privacy@apehour.it">privacy@apehour.it</a>.
        </p>`,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
