import { createClient } from "@/lib/supabase/client";

export interface MyProfile {
  name: string;
  phone: string;
  dateOfBirth: string; // ISO yyyy-mm-dd, "" se non impostata
  avatarUrl: string;
}

export async function getMyProfile(userId: string): Promise<MyProfile> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("name, phone, date_of_birth, avatar_url")
    .eq("id", userId)
    .single();
  if (error) throw new Error(error.message);
  return {
    name: data.name ?? "",
    phone: data.phone ?? "",
    dateOfBirth: data.date_of_birth ?? "",
    avatarUrl: data.avatar_url ?? "",
  };
}

export async function updateMyProfile(userId: string, patch: MyProfile): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      name: patch.name,
      phone: patch.phone || null,
      date_of_birth: patch.dateOfBirth || null,
      avatar_url: patch.avatarUrl || null,
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  // Il nome visualizzato nell'app viene letto da user_metadata (sessione auth),
  // va tenuto sincronizzato con la tabella profiles.
  const { error: metaErr } = await supabase.auth.updateUser({ data: { name: patch.name } });
  if (metaErr) throw new Error(metaErr.message);
}
