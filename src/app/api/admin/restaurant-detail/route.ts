import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "unknown" }, { status: 400 });

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return NextResponse.json({ error: "unknown" }, { status: 503 });
  const service = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: restaurant, error } = await service
    .from("restaurants")
    .select(
      "id, name, description, cuisine, tags, address, neighborhood, city, country, phone, website, email, " +
      "instagram, legal_name, vat_number, opening_hours, price_range, max_party_size, cover_image_url, " +
      "is_active, is_verified, created_at"
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !restaurant) return NextResponse.json({ error: "Locale non trovato" }, { status: 404 });

  const { data: images } = await service
    .from("restaurant_images")
    .select("url, is_cover, position")
    .eq("restaurant_id", id)
    .order("position", { ascending: true });

  return NextResponse.json({ restaurant, images: images ?? [] });
}
