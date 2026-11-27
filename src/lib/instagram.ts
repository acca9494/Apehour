// Il campo Instagram di un locale può contenere un link completo
// (https://instagram.com/nome) o solo l'handle (@nome, nome): normalizziamo
// in entrambi i casi così il link funziona sempre e mostriamo "@nome"
// invece della scritta generica "Instagram".
export function normalizeInstagram(value: string): { href: string; handle: string } {
  let raw = value.trim();
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      raw = url.pathname.split("/").filter(Boolean)[0] ?? raw;
    } catch {
      // ignora, usa il valore così com'è
    }
  }
  const handle = raw.replace(/^@/, "");
  return { href: `https://www.instagram.com/${handle}/`, handle: `@${handle}` };
}
