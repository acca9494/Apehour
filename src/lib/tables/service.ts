import { createClient } from "@/lib/supabase/client";
import type { MerchantTable } from "@/lib/merchant/store";

interface TableRow {
  id: string;
  name: string;
  capacity_max: number;
  zone: string;
  is_active: boolean;
  pos_x: number;
  pos_y: number;
  pos_width: number;
  pos_height: number;
}

function fromRow(row: TableRow): MerchantTable {
  return {
    id: row.id,
    name: row.name,
    capacity: row.capacity_max,
    zone: row.zone,
    status: row.is_active ? "active" : "inactive",
    x: row.pos_x,
    y: row.pos_y,
    width: row.pos_width,
    height: row.pos_height,
  };
}

export async function listTables(restaurantId: string): Promise<MerchantTable[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tables")
    .select("id, name, capacity_max, zone, is_active, pos_x, pos_y, pos_width, pos_height")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(fromRow);
}

export async function upsertTable(table: MerchantTable, restaurantId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("tables").upsert({
    id: table.id,
    restaurant_id: restaurantId,
    name: table.name,
    capacity_min: 1,
    capacity_max: table.capacity,
    zone: table.zone,
    is_active: table.status === "active",
    pos_x: table.x,
    pos_y: table.y,
    pos_width: table.width,
    pos_height: table.height,
  });
  if (error) throw new Error(error.message);
}

export async function deleteTable(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("tables").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getZones(restaurantId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("zone_names")
    .eq("id", restaurantId)
    .single();
  if (error) throw new Error(error.message);
  return (data?.zone_names as string[]) ?? [];
}

export async function addZone(name: string, restaurantId: string): Promise<string[]> {
  const zones = await getZones(restaurantId);
  if (zones.includes(name)) return zones;
  const next = [...zones, name];
  const supabase = createClient();
  const { error } = await supabase.from("restaurants").update({ zone_names: next }).eq("id", restaurantId);
  if (error) throw new Error(error.message);
  return next;
}
