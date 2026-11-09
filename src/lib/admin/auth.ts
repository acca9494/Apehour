import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAILS } from "@/lib/admin/constants";

export async function requireAdmin(): Promise<{ email: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) return null;
  return { email: user.email };
}
