export type EventItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
  price: string;
  ticketMode?: "paid" | "free" | "waitlist";
  bees: number;
  description: string;
  restaurantSlug: string;
  restaurantName: string;
  // Date/ora grezze (ISO), non formattate — servono solo al form di modifica
  // del locale in dashboard, che altrimenti non avrebbe modo di ripopolarsi
  // con i valori reali dell'evento (il campo "date" sopra è già formattato
  // per la visualizzazione pubblica, es. "Ven 12 dic · 19:00").
  eventDateRaw?: string;
  eventEndDateRaw?: string | null;
  startTimeRaw?: string;
};
