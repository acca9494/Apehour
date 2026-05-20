export type Cuisine =
  | "Spritz Bar"
  | "Wine Bar"
  | "Cocktail Bar"
  | "Vermouth Bar"
  | "Cicchetti Bar"
  | "Rooftop Bar"
  | "Negroni Bar"
  | "Champagne Bar"
  | "Brunch"
  | "Beer Bar"
  | "Whisky Bar";

export type PriceRange = "$$" | "$$$" | "$$$$";

export type BookingSlot = {
  id: string;
  time: string;
  label?: string;
  availableSeats: number;
  discount?: number;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  cuisine: Cuisine;
  rating: number;
  reviewCount: number;
  priceRange: PriceRange;
  distance: string;
  city: string;
  neighborhood: string;
  address: string;
  heroImage: string;
  gallery: string[];
  discount?: number;
  urgencyLabel: string;
  socialProof: string;
  description: string;
  tags: string[];
  menuPreview: MenuItem[];
  openingHours: OpeningHour[];
  coordinates: {
    lat: number;
    lng: number;
  };
  slots: BookingSlot[];
};

export type MenuItem = {
  name: string;
  description: string;
  price: string;
};

export type OpeningHour = {
  day: string;
  hours: string;
};

export type Review = {
  id: string;
  restaurantId: string;
  author: string;
  rating: number;
  body: string;
  date: string;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  discount: number;
  restaurantSlug: string;
};

export type BookingRequest = {
  restaurantId: string;
  date: string;
  time: string;
  guests: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
};

export type BookingConfirmation = {
  confirmationId: string;
  status: "confirmed";
  message: string;
};

export type SearchFilters = {
  city?: string;
  date?: string;
  time?: string;
  guests?: number;
  cuisine?: Cuisine | "All";
};
