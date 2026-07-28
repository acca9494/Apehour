export type AreaJob = {
  id: string;
  title: string;
  venueName: string;
  city: string;
  category: string;
  date: string;
  compenso: number;
};

export const AREA_JOBS: AreaJob[] = [
  { id: "aj-1", title: "Cercasi DJ per aperitivo del venerdì", venueName: "Spritz Brera",       city: "Milano",  category: "DJ set",          date: "6 Giu 2026",  compenso: 150 },
  { id: "aj-2", title: "Musicista live per serata jazz",        venueName: "Terrazza Monti",     city: "Roma",    category: "Musicista live",  date: "9 Giu 2026",  compenso: 200 },
  { id: "aj-3", title: "Performer per serata a tema",           venueName: "Campo de' Fiori Bar", city: "Bologna", category: "Performer",       date: "13 Giu 2026", compenso: 180 },
  { id: "aj-4", title: "DJ set rooftop estivo",                 venueName: "Oltrarno Negroni",    city: "Firenze", category: "DJ set",          date: "14 Giu 2026", compenso: 160 },
  { id: "aj-5", title: "Bartender flair per evento privato",    venueName: "Negroni House",        city: "Torino",  category: "Bartender flair", date: "16 Giu 2026", compenso: 140 },
  { id: "aj-6", title: "Duo acustico per aperitivo in terrazza", venueName: "Bacaro Rialto",       city: "Venezia", category: "Musicista live",  date: "18 Giu 2026", compenso: 190 },
  { id: "aj-7", title: "DJ set serata estate",                  venueName: "Prati Vermouth",       city: "Napoli",  category: "DJ set",          date: "20 Giu 2026", compenso: 170 },
  { id: "aj-8", title: "Animazione serata a tema anni '80",     venueName: "Stella Wines",          city: "Milano",  category: "Performer",       date: "22 Giu 2026", compenso: 155 },
];
