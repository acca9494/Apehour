export const ACTIVITY_KPI = [
  { icon: "🐝", label: "Partecipanti attivi",   value: "12.4K", trend: "+8% questo mese" },
  { icon: "🌊", label: "Attività organizzate",  value: "348",   trend: "+22 questo mese" },
  { icon: "🗑️", label: "Kg di rifiuti raccolti", value: "9.2T",  trend: "da tutta la community" },
  { icon: "⚡", label: "Attività attive oggi",  value: "14",    trend: "in corso ora" },
];

export type ActiveActivity = {
  id: string;
  title: string;
  location: string;
  date: string;
  category: string;
  spots: number;
  bees: number;
  icon: string;
};

export const ACTIVE_ACTIVITIES: ActiveActivity[] = [
  {
    id: "ostia",
    title: "Pulizia Spiaggia Ostia",
    location: "Roma · Ostia Lido",
    date: "22 Mag 2026",
    category: "Spiagge",
    spots: 12,
    bees: 30,
    icon: "🏖️",
  },
  {
    id: "sempione",
    title: "Pulizia Parco Sempione",
    location: "Milano · Sempione",
    date: "24 Mag 2026",
    category: "Parchi",
    spots: 8,
    bees: 25,
    icon: "🌳",
  },
  {
    id: "lungarno",
    title: "Pulizia Lungarno",
    location: "Firenze · Lungarno",
    date: "25 Mag 2026",
    category: "Fiumi",
    spots: 20,
    bees: 25,
    icon: "🌊",
  },
  {
    id: "navigli",
    title: "Plogging Navigli",
    location: "Milano · Navigli",
    date: "28 Mag 2026",
    category: "Sport & Natura",
    spots: 15,
    bees: 35,
    icon: "🏃",
  },
  {
    id: "rimini",
    title: "Pulizia Spiaggia Rimini",
    location: "Rimini · Marina Centro",
    date: "30 Mag 2026",
    category: "Spiagge",
    spots: 6,
    bees: 30,
    icon: "🏖️",
  },
];
