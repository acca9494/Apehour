import type { SupabaseClient } from "@supabase/supabase-js";
import { sendTransactionalEmail, emailShell } from "@/lib/email/send";

// Anonimizza prenotazioni/biglietti del cliente e poi elimina l'utente da
// auth.users — profilo, locale di proprietà e tutto il resto referenziato
// viene eliminato in cascata dal database (vedi database-schema.sql).
// Usata sia dall'auto-cancellazione (cliente) sia dall'eliminazione decisa
// dall'admin dopo una richiesta di cancellazione commerciante.
export async function deleteUserAccount(
  admin: SupabaseClient,
  userId: string,
  userEmail: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const anonymized = {
    customer_name: "Utente eliminato",
    customer_email: "eliminato@apehour.local",
    customer_phone: null,
    special_requests: null,
  };
  const { error: bookingsErr } = await admin.from("bookings").update(anonymized).eq("customer_id", userId);
  if (bookingsErr) return { ok: false, error: "Impossibile anonimizzare le prenotazioni: " + bookingsErr.message };

  const { error: ticketsErr } = await admin
    .from("ticket_requests")
    .update({ buyer_name: "Utente eliminato", buyer_email: "eliminato@apehour.local", buyer_phone: null })
    .eq("customer_id", userId);
  if (ticketsErr) return { ok: false, error: "Impossibile anonimizzare i biglietti: " + ticketsErr.message };

  const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
  if (deleteErr) return { ok: false, error: deleteErr.message };

  if (userEmail) {
    await sendTransactionalEmail({
      to: userEmail,
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

  return { ok: true };
}
