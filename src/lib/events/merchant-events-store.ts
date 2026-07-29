export interface MerchantEvent {
  id: string;
  slug: string;
  title: string;
  date: string;       // display string, es. "Sab 24 Mag · 18:00"
  location: string;
  image: string;       // URL immagine
  category: string;
  price: string;       // es. "da €20" oppure "Free entry"
  bees: number;
  description: string;
  restaurantSlug: string;
  restaurantName: string;
}

function eventsKey(merchantUserId: string) { return `appape_merchant_events_${merchantUserId}`; }

export function getMerchantEvents(merchantUserId: string): MerchantEvent[] {
  try {
    const raw = localStorage.getItem(eventsKey(merchantUserId));
    return raw ? (JSON.parse(raw) as MerchantEvent[]) : [];
  } catch {
    return [];
  }
}

export function saveMerchantEvents(events: MerchantEvent[], merchantUserId: string): void {
  localStorage.setItem(eventsKey(merchantUserId), JSON.stringify(events));
}

export function upsertMerchantEvent(event: MerchantEvent, merchantUserId: string): void {
  const all = getMerchantEvents(merchantUserId);
  const idx = all.findIndex((e) => e.id === event.id);
  if (idx === -1) all.push(event);
  else all[idx] = event;
  saveMerchantEvents(all, merchantUserId);
}

export function deleteMerchantEvent(id: string, merchantUserId: string): void {
  saveMerchantEvents(getMerchantEvents(merchantUserId).filter((e) => e.id !== id), merchantUserId);
}

// Public lookup across all merchants on this browser (mock limitation — no shared backend).
export function getAllMerchantEvents(): MerchantEvent[] {
  const all: MerchantEvent[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("appape_merchant_events_")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try { all.push(...(JSON.parse(raw) as MerchantEvent[])); } catch {}
    }
  } catch {}
  return all;
}

export function getMerchantEventBySlug(slug: string): MerchantEvent | undefined {
  return getAllMerchantEvents().find((e) => e.slug === slug);
}
