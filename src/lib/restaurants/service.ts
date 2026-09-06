import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { PriceRange } from "@/lib/types";

export interface RestaurantRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  cuisine: string;
  tags: string[];
  address: string | null;
  neighborhood: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
  price_range: PriceRange;
  cover_image_url: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  instagram: string | null;
  rating: number;
  review_count: number;
  urgency_label: string | null;
  social_proof: string | null;
  deposit_required: boolean;
  deposit_amount: number | null;
  deposit_per_person: boolean;
  deposit_policy: string | null;
  max_party_size: number;
  is_active: boolean;
  is_verified: boolean;
}

export interface CreateRestaurantInput {
  ownerId: string;
  name: string;
  address: string;
  city: string;
  priceRange: PriceRange;
  cuisine?: string;
  heroImage?: string;
  phone?: string;
  email?: string;
}

// Genera uno slug unico aggiungendo -2, -3... in caso di collisione col nome.
async function uniqueSlug(base: string): Promise<string> {
  const supabase = createClient();
  const root = slugify(base);
  let slug = root;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await supabase.from("restaurants").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${root}-${n++}`;
  }
}

export async function createRestaurant(input: CreateRestaurantInput): Promise<RestaurantRow> {
  const supabase = createClient();
  const slug = await uniqueSlug(input.name);

  const { data, error } = await supabase
    .from("restaurants")
    .insert({
      owner_id: input.ownerId,
      name: input.name,
      slug,
      cuisine: input.cuisine ?? "Aperitivo",
      address: input.address,
      city: input.city,
      price_range: input.priceRange,
      cover_image_url: input.heroImage ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as RestaurantRow;
}

export async function getMyRestaurant(ownerId: string): Promise<RestaurantRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as RestaurantRow | null;
}

export async function updateRestaurant(id: string, patch: Partial<CreateRestaurantInput>): Promise<RestaurantRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.address !== undefined && { address: patch.address }),
      ...(patch.city !== undefined && { city: patch.city }),
      ...(patch.priceRange !== undefined && { price_range: patch.priceRange }),
      ...(patch.heroImage !== undefined && { cover_image_url: patch.heroImage }),
      ...(patch.phone !== undefined && { phone: patch.phone }),
      ...(patch.email !== undefined && { email: patch.email }),
      ...(patch.cuisine !== undefined && { cuisine: patch.cuisine }),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as RestaurantRow;
}

export interface VenueSettingsPatch {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  instagram?: string;
  heroImage: string;
  depositRequired: boolean;
  depositAmount: number;
  depositPerPerson: boolean;
  depositPolicy: string;
}

export async function updateVenueSettingsRow(id: string, patch: VenueSettingsPatch): Promise<RestaurantRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .update({
      name: patch.name,
      description: patch.description,
      address: patch.address,
      city: patch.city,
      phone: patch.phone,
      email: patch.email,
      website: patch.website ?? null,
      instagram: patch.instagram ?? null,
      cover_image_url: patch.heroImage,
      deposit_required: patch.depositRequired,
      deposit_amount: patch.depositAmount,
      deposit_per_person: patch.depositPerPerson,
      deposit_policy: patch.depositPolicy,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as RestaurantRow;
}

export async function getAllActiveRestaurants(): Promise<RestaurantRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("restaurants").select("*").eq("is_active", true);
  if (error) throw new Error(error.message);
  return (data ?? []) as RestaurantRow[];
}

export async function getRestaurantBySlug(slug: string): Promise<RestaurantRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("restaurants").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data as RestaurantRow | null;
}

// Crea il locale del commerciante al primo accesso confermato, usando i dati
// salvati in user_metadata alla registrazione (form in due step: la registrazione
// può avvenire prima della conferma email, quindi la creazione va rimandata a
// quando esiste davvero una sessione con auth.uid() valido per la RLS).
export async function ensureRestaurantForOwner(ownerId: string): Promise<RestaurantRow | null> {
  const existing = await getMyRestaurant(ownerId);
  if (existing) return existing;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const meta = user?.user_metadata as Record<string, string> | undefined;
  if (!meta?.venue_name) return null;

  return createRestaurant({
    ownerId,
    name: meta.venue_name,
    address: meta.venue_address ?? "",
    city: meta.venue_city || "Roma",
    priceRange: (meta.venue_price_range as PriceRange) ?? "$$",
    email: user?.email ?? undefined,
  });
}
