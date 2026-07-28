export type AvailableArtist = {
  id: string;
  name: string;
  discipline: string;
  city: string;
  rate?: string;
  rating: number;
  likes: number;
  avatar: string;
  bio: string;
};

export const AVAILABLE_ARTISTS: AvailableArtist[] = [
  { id: "art-1", name: "Giulia Ferri",    discipline: "DJ set",          city: "Milano",  rate: "€100 – €180", rating: 4.8, likes: 132, avatar: "🎧", bio: "DJ set house ed elettronica per aperitivi e serate rooftop." },
  { id: "art-2", name: "Marco Villa",     discipline: "Musicista live",  city: "Roma",    rate: "€120 – €220", rating: 4.6, likes: 98,  avatar: "🎸", bio: "Chitarrista e cantautore, repertorio acustico ed elettrico." },
  { id: "art-3", name: "Sara Conti",      discipline: "Performer",       city: "Firenze", rate: "€90 – €160",  rating: 4.9, likes: 156, avatar: "🎭", bio: "Performance visive e animazione per eventi a tema." },
  { id: "art-4", name: "Luca Bianchi",    discipline: "Bartender flair", city: "Torino",  rate: "€80 – €140",  rating: 4.5, likes: 74,  avatar: "🍸", bio: "Flair bartending e cocktail show per eventi privati." },
  { id: "art-5", name: "Elena Rossi",     discipline: "DJ set",          city: "Napoli",  rate: "€110 – €190", rating: 4.7, likes: 121, avatar: "🎧", bio: "Selezioni deep house e afrobeat per aperitivi estivi." },
  { id: "art-6", name: "Davide Moretti",  discipline: "Musicista live",  city: "Venezia", rate: "€130 – €210", rating: 4.4, likes: 63,  avatar: "🎹", bio: "Pianista jazz per aperitivi in terrazza e serate intime." },
  { id: "art-7", name: "Chiara Galli",    discipline: "Performer",       city: "Bologna", rate: "€95 – €170",  rating: 4.8, likes: 109, avatar: "🎪", bio: "Animazione e intrattenimento per serate a tema." },
  { id: "art-8", name: "Andrea Ricci",    discipline: "DJ set",          city: "Milano",  rate: "€100 – €175", rating: 4.3, likes: 55,  avatar: "🎧", bio: "Vinyl DJ set, selezioni disco e funk." },
];
