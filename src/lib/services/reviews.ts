import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";

// Recensioni reali (tabella public.reviews, sempre legate a una prenotazione
// confermata — vedi policy "reviews: customer insert"). Non esiste un campo
// pubblico con il nome del recensore (profiles non è leggibile da anon), quindi
// mostriamo un'etichetta generica invece di inventare un autore.
const ANONYMOUS_AUTHOR = "Cliente verificato";

export async function getReviews(restaurantId?: string, limit = 12): Promise<Review[]> {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("id, restaurant_id, rating, body, created_at")
    .eq("is_published", true)
    .not("body", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (restaurantId) query = query.eq("restaurant_id", restaurantId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    restaurantId: row.restaurant_id as string,
    author: ANONYMOUS_AUTHOR,
    rating: row.rating as number,
    body: row.body as string,
    date: row.created_at as string,
  }));
}
