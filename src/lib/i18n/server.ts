import { cookies } from "next/headers";
import { T, type Lang } from "./translations";

// Legge la lingua scelta (cookie impostato da LanguageProvider) per i
// Server Component, che non hanno accesso a localStorage/useLang().
export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  return store.get("apehour_lang")?.value === "en" ? "en" : "it";
}

export async function getServerT() {
  return T[await getServerLang()];
}
