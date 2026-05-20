// Pattern-based content moderation for Italian language
// Blocks: profanity, blasphemy, racial slurs, targeted insults

const BLOCKED_PATTERNS: RegExp[] = [
  // Profanity — common Italian
  /\bcazz[oa]?\b/i,
  /\bminchi[ae]?\b/i,
  /\bstronz[oa]?\b/i,
  /\bmerda\b/i,
  /\bculo\b/i,
  /\bfanculo\b/i,
  /\bvaffanculo\b/i,
  /\bcoglion[ei]?\b/i,
  /\bsegaiolo?\b/i,
  /\bputtana\b/i,
  /\btroia\b/i,
  /\bbastardo\b/i,
  /\bfiga\b/i,
  /\bcazzo\b/i,

  // Blasphemy — common Italian blasphemies (abbreviated to avoid storing full forms)
  /\bporco\s*(dio|gesù|madonna|cristo|giuda)\b/i,
  /\bdiomadonna\b/i,
  /\bgesùcristo\b/i,
  /\bmadonn[ae]\b/i,
  /\bcristodio\b/i,

  // Insults
  /\bidiota\b/i,
  /\bimbecille\b/i,
  /\bcretino\b/i,
  /\bdeficiente\b/i,
  /\bscemo\b/i,
  /\bfesso\b/i,
  /\bbecco\b/i,

  // Hate speech patterns
  /\bnegr[oi]\b/i,
  /\bterron[ei]?\b/i,
  /\bfrocio\b/i,
  /\bfroci\b/i,

  // English profanity (common crossover)
  /\bfuck\b/i,
  /\bshit\b/i,
  /\bbitch\b/i,
  /\basshole\b/i,
];

export function moderateText(text: string): { ok: boolean; reason?: string } {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { ok: false, reason: "Il messaggio è vuoto." };
  }

  if (trimmed.length > 280) {
    return { ok: false, reason: "Massimo 280 caratteri." };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { ok: false, reason: "Messaggio non consentito. Rispetta gli altri utenti." };
    }
  }

  return { ok: true };
}
