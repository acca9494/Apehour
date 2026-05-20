import type { Promotion, Restaurant, Review } from "@/lib/types";

export const restaurants: Restaurant[] = [
  {
    id: "rst-001",
    slug: "spritz-brera",
    name: "Spritz Brera",
    cuisine: "Spritz Bar",
    rating: 4.8,
    reviewCount: 1284,
    priceRange: "$$",
    distance: "0.7 km",
    city: "Milan",
    neighborhood: "Brera",
    address: "Via Solferino 22, Milano",
    heroImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    ],
    discount: 30,
    urgencyLabel: "Pochi tavoli liberi",
    socialProof: "Riservato 86 volte questa settimana",
    description:
      "Il punto di riferimento per l'aperitivo nel cuore di Brera. Spritz artigianali, cicchetti d'autore e lista di vini naturali per un rito serale che vale la riserva.",
    tags: ["Spritz", "Cicchetti", "Terrazza"],
    menuPreview: [
      {
        name: "Aperol Spritz",
        description: "Prosecco DOC, Aperol, acqua frizzante, arancia",
        price: "9",
      },
      {
        name: "Cicchetti misti",
        description: "Baccalà mantecato, sarde in saor, tramezzino",
        price: "14",
      },
      {
        name: "Negroni",
        description: "Gin artigianale, Campari, vermouth rosso",
        price: "11",
      },
    ],
    openingHours: [
      { day: "Lun - Ven", hours: "17:30 - 23:30" },
      { day: "Sab - Dom", hours: "12:00 - 00:30" },
    ],
    coordinates: { lat: 45.472, lng: 9.187 },
    slots: [
      { id: "sb-1800", time: "18:00", availableSeats: 8, discount: 30 },
      { id: "sb-1930", time: "19:30", label: "Aperitivo peak", availableSeats: 4, discount: 20 },
      { id: "sb-2100", time: "21:00", availableSeats: 12 },
    ],
  },
  {
    id: "rst-002",
    slug: "stella-wines",
    name: "Stella Wines",
    cuisine: "Wine Bar",
    rating: 4.9,
    reviewCount: 942,
    priceRange: "$$$",
    distance: "1.2 km",
    city: "Milan",
    neighborhood: "Porta Nuova",
    address: "Piazza Gae Aulenti 6, Milano",
    heroImage:
      "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
    ],
    discount: 20,
    urgencyLabel: "Solo 2 posti al banco",
    socialProof: "Preferito dagli enofili di Milano",
    description:
      "Enoteca contemporanea con selezione di vini naturali, biodinamici e artigianali. L'aperitivo qui è un atto di cura — nessuna fretta, solo il vino giusto.",
    tags: ["Vini naturali", "Banco degustazione", "Negroni sbagliato"],
    menuPreview: [
      {
        name: "Vino orange naturale",
        description: "Biodinamico, Friuli, senza solfiti aggiunti",
        price: "12",
      },
      {
        name: "Tagliere formaggi",
        description: "Selezione di 5 formaggi artigianali, miele, noci",
        price: "18",
      },
      {
        name: "Negroni sbagliato",
        description: "Campari, vermouth rosso, prosecco",
        price: "11",
      },
    ],
    openingHours: [
      { day: "Mar - Gio", hours: "17:00 - 23:00" },
      { day: "Ven - Sab", hours: "16:30 - 00:00" },
      { day: "Dom - Lun", hours: "Chiuso" },
    ],
    coordinates: { lat: 45.484, lng: 9.19 },
    slots: [
      { id: "sw-1830", time: "18:30", availableSeats: 6, discount: 20 },
      { id: "sw-2000", time: "20:00", label: "Ultimi posti", availableSeats: 2 },
      { id: "sw-2130", time: "21:30", availableSeats: 5 },
    ],
  },
  {
    id: "rst-003",
    slug: "cafe-marais",
    name: "Café Marais",
    cuisine: "Champagne Bar",
    rating: 4.7,
    reviewCount: 713,
    priceRange: "$$$$",
    distance: "2.1 km",
    city: "Paris",
    neighborhood: "Le Marais",
    address: "18 Rue Vieille du Temple, Paris",
    heroImage:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80",
    ],
    urgencyLabel: "Tavoli privati quasi esauriti",
    socialProof: "Amato dal 94% delle coppie",
    description:
      "Aperitivo parigino nel cuore del Marais. Champagne della Maison, tartine d'autore e un'ora dorata prima di cena che vale il viaggio.",
    tags: ["Champagne", "Romantico", "Wine pairing"],
    menuPreview: [
      {
        name: "Kir Royal",
        description: "Crème de cassis, Champagne Brut",
        price: "15",
      },
      {
        name: "Toast foie gras",
        description: "Fico, gelatina di Sauternes, sale di Guérande",
        price: "22",
      },
      {
        name: "Coupe Champagne",
        description: "Selezione del sommelier, abbinamento stagionale",
        price: "18",
      },
    ],
    openingHours: [
      { day: "Lun - Ven", hours: "17:00 - 23:00" },
      { day: "Sab", hours: "12:00 - 15:00, 17:00 - 23:30" },
      { day: "Dom", hours: "Chiuso" },
    ],
    coordinates: { lat: 48.858, lng: 2.361 },
    slots: [
      { id: "cm-1845", time: "18:45", availableSeats: 7 },
      { id: "cm-2015", time: "20:15", label: "Menu degustazione", availableSeats: 3 },
      { id: "cm-2200", time: "22:00", availableSeats: 9 },
    ],
  },
  {
    id: "rst-004",
    slug: "el-vermut",
    name: "El Vermut",
    cuisine: "Vermouth Bar",
    rating: 4.6,
    reviewCount: 1568,
    priceRange: "$$",
    distance: "0.4 km",
    city: "Barcelona",
    neighborhood: "Eixample",
    address: "Carrer de Mallorca 255, Barcelona",
    heroImage:
      "https://images.unsplash.com/photo-1564759298141-cef5ca4a5c38?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
    ],
    discount: 40,
    urgencyLabel: "40% fino alle 19:30",
    socialProof: "Riservato 120 volte questa settimana",
    description:
      "La tradizione del vermut domenicale portata ogni giorno dell'anno. Tapas fresche, carta dei vermut da 40 etichette e terrazza sull'Eixample.",
    tags: ["Terrazza", "Tapas", "Gruppi"],
    menuPreview: [
      {
        name: "Vermut di casa",
        description: "Rojo, con olive, arancia e seltz",
        price: "7",
      },
      {
        name: "Patatas bravas",
        description: "Salsa brava piccante, alioli home-made",
        price: "8",
      },
      {
        name: "Jamón ibérico",
        description: "Bellota DOP, pane con pomodoro",
        price: "16",
      },
    ],
    openingHours: [
      { day: "Tutti i giorni", hours: "12:00 - 00:00" },
      { day: "Cucina", hours: "12:30 - 23:00" },
      { day: "Brunch", hours: "Sab - Dom 11:00 - 15:00" },
    ],
    coordinates: { lat: 41.393, lng: 2.165 },
    slots: [
      { id: "ev-1800", time: "18:00", label: "40% off", availableSeats: 10, discount: 40 },
      { id: "ev-1930", time: "19:30", availableSeats: 5, discount: 30 },
      { id: "ev-2100", time: "21:00", availableSeats: 11 },
    ],
  },
  {
    id: "rst-005",
    slug: "negroni-house",
    name: "The Negroni House",
    cuisine: "Negroni Bar",
    rating: 4.8,
    reviewCount: 889,
    priceRange: "$$$",
    distance: "1.5 km",
    city: "London",
    neighborhood: "Soho",
    address: "42 Dean Street, London",
    heroImage:
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    ],
    discount: 25,
    urgencyLabel: "Negroni night in corso",
    socialProof: "Miglior cocktail bar di Soho",
    description:
      "Ventiquattro varianti del Negroni, dal classico al contemporaneo. Un bar piccolo e pieno di carattere, costruito per chi ama un aperitivo senza compromessi.",
    tags: ["Negroni", "Cocktail artigianali", "Private bar"],
    menuPreview: [
      {
        name: "Classic Negroni",
        description: "Gin, Campari, vermouth rosso, arancia",
        price: "13",
      },
      {
        name: "Boulevardier",
        description: "Bourbon, Campari, vermouth dolce",
        price: "14",
      },
      {
        name: "Americano",
        description: "Campari, vermouth rosso, seltz",
        price: "11",
      },
    ],
    openingHours: [
      { day: "Lun - Gio", hours: "17:00 - 23:00" },
      { day: "Ven - Sab", hours: "16:30 - 00:30" },
      { day: "Dom", hours: "17:00 - 22:00" },
    ],
    coordinates: { lat: 51.514, lng: -0.132 },
    slots: [
      { id: "nh-1830", time: "18:30", availableSeats: 6, discount: 25 },
      { id: "nh-2000", time: "20:00", label: "Peak hour", availableSeats: 3 },
      { id: "nh-2130", time: "21:30", availableSeats: 8 },
    ],
  },
  {
    id: "rst-006",
    slug: "terrazza-monti",
    name: "Terrazza Monti",
    cuisine: "Rooftop Bar",
    rating: 4.5,
    reviewCount: 632,
    priceRange: "$$",
    distance: "0.9 km",
    city: "Rome",
    neighborhood: "Monti",
    address: "Via Urbana 88, Roma",
    heroImage:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515669097368-22e68427d265?auto=format&fit=crop&w=1200&q=80",
    ],
    urgencyLabel: "Tramonto da stasera alle 20:30",
    socialProof: "Nuovo preferito del Rione Monti",
    description:
      "Terrazza sui tetti di Monti con vista sui monumenti di Roma. Hugo Spritz, bruschette romane e un tramonto da prenotare prima che finisca.",
    tags: ["Terrazza", "Vista Roma", "Campari"],
    menuPreview: [
      {
        name: "Hugo Spritz",
        description: "Prosecco, elderflower, soda, menta, lime",
        price: "10",
      },
      {
        name: "Bruschette romane",
        description: "Pomodoro pachino, basilico, olio EVO",
        price: "8",
      },
      {
        name: "Campari Soda",
        description: "Campari, soda, arancia fresca",
        price: "9",
      },
    ],
    openingHours: [
      { day: "Mar - Sab", hours: "17:00 - 00:00" },
      { day: "Dom", hours: "12:00 - 16:00" },
      { day: "Lun", hours: "Chiuso" },
    ],
    coordinates: { lat: 41.895, lng: 12.494 },
    slots: [
      { id: "tm-1900", time: "19:00", availableSeats: 9 },
      { id: "tm-2030", time: "20:30", label: "Ora del tramonto", availableSeats: 6 },
      { id: "tm-2200", time: "22:00", availableSeats: 12 },
    ],
  },
];

export const reviews: Review[] = [
  {
    id: "rev-001",
    restaurantId: "rst-001",
    author: "Martina",
    rating: 5,
    body: "Lo Spritz è perfetto e i cicchetti fanno la differenza. Prenotato alle 18:55, seduta alle 19:30.",
    date: "2026-03-28",
  },
  {
    id: "rev-002",
    restaurantId: "rst-002",
    author: "Leon",
    rating: 5,
    body: "Carta dei vini naturali impeccabile. Il Negroni sbagliato con bollicine è memorabile.",
    date: "2026-03-21",
  },
  {
    id: "rev-003",
    restaurantId: "rst-004",
    author: "Sofia",
    rating: 4.8,
    body: "Il vermut di casa con le patatas bravas è imbattibile. L'offerta early bird è un regalo.",
    date: "2026-03-19",
  },
];

export const promotions: Promotion[] = [
  {
    id: "promo-001",
    title: "Early aperitivo",
    description: "Fino al 40% di sconto sui tavoli prima delle 19:30.",
    discount: 40,
    restaurantSlug: "el-vermut",
  },
  {
    id: "promo-002",
    title: "Degustazione vini naturali",
    description: "Selezione biodinamica con conferma istantanea stasera.",
    discount: 20,
    restaurantSlug: "stella-wines",
  },
  {
    id: "promo-003",
    title: "Aperitivo romantico",
    description: "Tavoli per due con slot serali e rating altissimo.",
    discount: 30,
    restaurantSlug: "spritz-brera",
  },
];
