import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Informativa sul trattamento dei dati personali ai sensi del GDPR (Regolamento UE 2016/679).",
};

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__inner">
        <p className="eyebrow">Legale</p>
        <h1>Privacy Policy</h1>
        <p className="legal-page__updated">Ultimo aggiornamento: 25 maggio 2026</p>

        <section>
          <h2>1. Titolare del trattamento</h2>
          <p>
            Il Titolare del trattamento dei dati personali è <strong>ApeHour S.r.l.</strong> (di seguito "ApeHour"),
            con sede legale in Italia. Per qualsiasi comunicazione relativa al trattamento dei dati personali puoi
            contattarci all'indirizzo e-mail: <a href="mailto:privacy@apehour.it">privacy@apehour.it</a>.
          </p>
        </section>

        <section>
          <h2>2. Dati raccolti e finalità</h2>
          <p>Raccogliamo i seguenti dati personali:</p>
          <ul>
            <li>
              <strong>Dati di registrazione:</strong> nome, indirizzo e-mail, password (in forma cifrata),
              numero di telefono — per creare e gestire il tuo account.
            </li>
            <li>
              <strong>Dati di prenotazione:</strong> data, orario, numero di persone, locale selezionato —
              per elaborare e confermare le prenotazioni.
            </li>
            <li>
              <strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate, durata
              della sessione — per garantire la sicurezza e il corretto funzionamento del servizio.
            </li>
            <li>
              <strong>Comunicazioni:</strong> messaggi inviati tramite il modulo di contatto o la chat
              integrata — per rispondere alle richieste.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Base giuridica del trattamento</h2>
          <ul>
            <li><strong>Esecuzione del contratto</strong> (art. 6, par. 1, lett. b GDPR): gestione dell'account e delle prenotazioni.</li>
            <li><strong>Consenso</strong> (art. 6, par. 1, lett. a GDPR): comunicazioni di marketing, newsletter e cookie non essenziali.</li>
            <li><strong>Legittimo interesse</strong> (art. 6, par. 1, lett. f GDPR): prevenzione frodi, sicurezza informatica, miglioramento del servizio.</li>
            <li><strong>Obbligo legale</strong> (art. 6, par. 1, lett. c GDPR): adempimenti fiscali e contabili.</li>
          </ul>
        </section>

        <section>
          <h2>4. Conservazione dei dati</h2>
          <p>
            I dati dell'account vengono conservati per tutta la durata del rapporto contrattuale e per
            un ulteriore periodo di <strong>10 anni</strong> dall'ultima interazione, salvo obblighi di legge più lunghi.
            I dati di navigazione vengono conservati per un massimo di <strong>13 mesi</strong>.
            I dati relativi alle prenotazioni sono conservati per <strong>10 anni</strong> ai fini fiscali.
          </p>
        </section>

        <section>
          <h2>5. Destinatari dei dati</h2>
          <p>I tuoi dati possono essere condivisi con:</p>
          <ul>
            <li>I locali partner, limitatamente ai dati necessari per gestire la prenotazione.</li>
            <li>Fornitori di servizi tecnici (hosting, e-mail, pagamenti) che agiscono come responsabili del trattamento ai sensi dell'art. 28 GDPR.</li>
            <li>Autorità pubbliche, quando previsto dalla legge.</li>
          </ul>
          <p>Non vendiamo né cediamo i tuoi dati a terzi per finalità di marketing.</p>
        </section>

        <section>
          <h2>6. Trasferimento dei dati extra-UE</h2>
          <p>
            Alcuni nostri fornitori potrebbero elaborare dati al di fuori dello Spazio Economico Europeo.
            In tal caso ci assicuriamo che il trasferimento avvenga nel rispetto delle garanzie previste
            dal GDPR (decisioni di adeguatezza, clausole contrattuali tipo della Commissione Europea).
          </p>
        </section>

        <section>
          <h2>7. I tuoi diritti</h2>
          <p>Ai sensi degli artt. 15–22 GDPR hai diritto di:</p>
          <ul>
            <li><strong>Accesso</strong>: ottenere conferma del trattamento e copia dei dati.</li>
            <li><strong>Rettifica</strong>: correggere dati inesatti o integrarli.</li>
            <li><strong>Cancellazione</strong>: ottenere la cancellazione dei dati ("diritto all'oblio").</li>
            <li><strong>Limitazione</strong>: limitare il trattamento in determinate circostanze.</li>
            <li><strong>Portabilità</strong>: ricevere i dati in formato strutturato e leggibile da macchina.</li>
            <li><strong>Opposizione</strong>: opporti al trattamento basato su legittimo interesse o per finalità di marketing diretto.</li>
            <li><strong>Revoca del consenso</strong>: revocare in qualsiasi momento il consenso prestato, senza pregiudicare la liceità del trattamento precedente.</li>
          </ul>
          <p>
            Per esercitare i tuoi diritti scrivi a <a href="mailto:privacy@apehour.it">privacy@apehour.it</a>.
            Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali
            (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>).
          </p>
        </section>

        <section>
          <h2>8. Cookie</h2>
          <p>
            Per informazioni dettagliate sull'utilizzo dei cookie consulta la nostra{" "}
            <Link href="/cookie-policy">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2>9. Modifiche alla Privacy Policy</h2>
          <p>
            Ci riserviamo di aggiornare la presente informativa. Le modifiche sostanziali saranno
            comunicate tramite avviso in evidenza sul sito o via e-mail. La versione aggiornata sarà
            sempre disponibile a questo indirizzo.
          </p>
        </section>
      </div>
    </div>
  );
}
