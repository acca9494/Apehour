import { createClient } from "@/lib/supabase/client";

export type ImageCategory = "gallery" | "menu" | "dish";

export interface GalleryImage {
  id: string;
  url: string;
  position: number;
}

export async function listGalleryImages(restaurantId: string, category: ImageCategory = "gallery"): Promise<GalleryImage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurant_images")
    .select("id, url, position")
    .eq("restaurant_id", restaurantId)
    .eq("category", category)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as GalleryImage[];
}

export async function addGalleryImage(restaurantId: string, url: string, category: ImageCategory = "gallery"): Promise<GalleryImage> {
  const supabase = createClient();
  const { count } = await supabase
    .from("restaurant_images")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("category", category);
  const { data, error } = await supabase
    .from("restaurant_images")
    .insert({ restaurant_id: restaurantId, url, position: count ?? 0, category })
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

export async function reorderGalleryImages(images: GalleryImage[]): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    images.map((img, i) => supabase.from("restaurant_images").update({ position: i }).eq("id", img.id))
  );
}
