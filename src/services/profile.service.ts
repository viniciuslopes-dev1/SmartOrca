import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/services/service-error";

export async function getCurrentProfile() {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError) throw normalizeSupabaseError(userError);
  if (!user) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}
