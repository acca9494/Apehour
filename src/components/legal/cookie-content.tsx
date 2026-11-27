import Link from "next/link";

const LAST_UPDATED = "27 novembre 2026";

export function CookieContent() {
  return (
    <>
      <p className="legal-page__updated">Ultimo aggiornamento: {LAST_UPDATED}</p>

      <section>
        <h2>1. Cosa sono i cookie</h2>
        <p>
          I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo quando li visiti.
          Servono a far funzionare correttamente il sito, a ricordare le tue preferenze e — se lo accetti —
          a migliorare la tua esperienza attraverso funzionalità di terze parti.
        </p>
      </section>

      <section>
        <h2>2. Cookie che utilizziamo</h2>

        <h3>Cookie tecnici essenziali</h3>
        <p>
          Necessari per il funzionamento del sito. Non richiedono il tuo consenso e non possono essere
          disabilitati senza compromettere le funzionalità di base.
        </p>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Scopo</th>
                <th>Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>apehour_session</code></td>
                <td>Gestione della sessione autenticata</td>
                <td>Sessione</td>
              </tr>
              <tr>
                <td><code>apehour_cookie_consent</code></td>
                <td>Memorizza le preferenze di consenso cookie</td>
                <td>12 mesi</td>
              </tr>
              <tr>
                <td><code>apehour_lang</code></td>
                <td>Lingua preferita dall'utente</td>
                <td>12 mesi</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Mappa interattiva</h3>
        <p>
          Le tile cartografiche della mappa (dati di OpenStreetMap, elaborati da MapTiler) vengono
          caricate attraverso un nostro server proxy: il tuo browser non contatta mai direttamente
          OpenStreetMap o MapTiler, che quindi non ricevono il tuo indirizzo IP e non impostano
          alcun cookie sul tuo dispositivo. Non è necessario alcun consenso per questa funzionalità.
        </p>

        <h3>Analytics interne (nessun consenso richiesto)</h3>
        <p>
          Per capire quali pagine e quali locali vengono visitati raccogliamo alcune informazioni di
          navigazione (la pagina visitata e il sito di provenienza, se presente) in forma aggregata e
          anonima. Non utilizziamo un cookie ma un identificativo temporaneo salvato nella memoria di
          sessione del browser (<code>sessionStorage</code>), che viene cancellato automaticamente alla
          chiusura della scheda o del browser: non è quindi in grado di riconoscerti tra una visita e
          l'altra. Non salviamo il tuo indirizzo IP, non incrociamo questi dati con il tuo account e non
          li condividiamo con terze parti. I dati raccolti vengono cancellati automaticamente dopo 13
          mesi, in linea con quanto indicato nella nostra Privacy Policy per i dati di navigazione.
          Trattandosi di uno strumento assimilabile ai cookie tecnici (nessuna profilazione,
          nessuna condivisione con terzi, nessun identificativo persistente), non richiede il tuo
          consenso ai sensi delle linee guida del Garante Privacy sui cookie e altri strumenti di
          tracciamento.
        </p>
      </section>

      <section>
        <h2>3. Come gestire i cookie</h2>
        <p>
          Puoi revocare o modificare le tue preferenze in qualsiasi momento cliccando su "Gestisci cookie"
          in fondo alla pagina, oppure configurando il tuo browser. Tieni presente che disabilitare i
          cookie tecnici potrebbe compromettere alcune funzionalità del sito.
        </p>
        <p>Istruzioni per i principali browser:</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
          <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
        </ul>
      </section>

      <section>
        <h2>4. Modifiche alla Cookie Policy</h2>
        <p>
          Ci riserviamo di aggiornare la presente policy. La data di "ultimo aggiornamento" in cima
          alla pagina indica quando è stata effettuata l'ultima revisione.
        </p>
      </section>

      <section>
        <h2>5. Contatti</h2>
        <p>
          Per domande sui cookie o per esercitare i diritti previsti dal GDPR scrivici a{" "}
          <a href="mailto:privacy@apehour.it">privacy@apehour.it</a> oppure consulta la nostra{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>
    </>
  );
}
