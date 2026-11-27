// Rileva righe "titolo" (tutto maiuscolo, corte, es. "CUCINA", "EVENTI") nella
// descrizione in testo semplice e le mostra in grassetto su una riga a sé,
// invece di lasciarle annegate nel paragrafo.
const HEADING_RE = /^[A-ZÀ-Ý][A-ZÀ-Ý\s]{1,29}$/;

export function FormattedDescription({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <>
      {blocks.map((block, i) =>
        HEADING_RE.test(block) ? (
          <p key={i} className="detail-desc__heading">{block}</p>
        ) : (
          <p key={i} className="detail-desc__text">{block}</p>
        )
      )}
    </>
  );
}
