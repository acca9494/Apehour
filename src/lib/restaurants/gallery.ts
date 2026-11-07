import { createClient } from "@/lib/supabase/client";

export interface GalleryImage {
  id: string;
  url: string;
  position: number;
}

export async function listGalleryImages(restaurantId: string): Promise<GalleryImage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurant_images")
    .select("id, url, position")
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as GalleryImage[];
}

export async function addGalleryImage(restaurantId: string, url: string): Promise<GalleryImage> {
  const supabase = createClient();
  const { count } = await supabase
    .from("restaurant_images")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId);
  const { data, error } = await supabase
    .from("restaurant_images")
    .insert({ restaurant_id: restaurantId, url, position: count ?? 0 })
    .select("id, url, position")
    .single();
  if (error) throw new Error(error.message);
  return data as GalleryImage;
}

export async function removeGalleryImage(imageId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("restaurant_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);
}
