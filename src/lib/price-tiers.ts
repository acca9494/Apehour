import type { PriceRange } from "@/lib/types";

// Unica fonte di verità per fascia prezzo → simbolo mostrato ai clienti.
// $$ mostra un solo €uro (Vespa Sprint = la fascia più economica disponibile,
// non esiste un livello "$" nel sistema). Usata sia dalle card che dall'hero
// della pagina locale, così il simbolo non diverge mai tra le due.
export const PRICE_INFO: Record<PriceRange, { img: string; label: string; budget: string }> = {
  "$$":   { img: "/vespa-v2.png", label: "Vespa Sprint", budget: "€" },
  "$$$":  { img: "/plus-v2.png",  label: "Ape Plus",     budget: "€€" },
  "$$$$": { img: "/bombo-v2.png", label: "Bombo Queen",  budget: "€€€" },
};
