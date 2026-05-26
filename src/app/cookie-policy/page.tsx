import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Informativa sull'uso dei cookie ai sensi del D. Lgs. 196/2003 e del GDPR.",
};

const LAST_UPDATED = "25 maggio 2026";

export default function CookiePolicyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__inner">
        <p className="eyebrow">Legale</p>
        <h1>Cookie Policy</h1>
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

          <h3>Cookie di terze parti (mappa)</h3>
          <p>
            Quando visualizzi la mappa interattiva, le tiles cartografiche vengono caricate da{" "}
            <strong>OpenStreetMap Foundation</strong>. OpenStreetMap potrebbe impostare cookie propri
            e raccogliere il tuo indirizzo IP per fornire il servizio. Ti invitiamo a consultare
            la <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy di OpenStreetMap
            </a>.
          </p>
          <div className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Fornitore</th>
                  <th>Scopo</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>OpenStreetMap</td>
                  <td>Visualizzazione mappa interattiva e tile cartografiche</td>
                  <td>Terza parte</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Cookie analitici (solo con consenso)</h3>
          <p>
            Non utilizziamo attualmente cookie di analisi o profilazione. Qualora in futuro dovessimo
            introdurli, aggiorneremo questa policy e ti chiederemo un nuovo consenso esplicito.
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
      </div>
    </div>
  );
}
