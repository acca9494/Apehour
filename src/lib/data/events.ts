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
};
