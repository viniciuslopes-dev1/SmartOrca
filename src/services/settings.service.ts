import { DEFAULT_WORKSPACE_ID } from "@/lib/constants/workspace";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/services/service-error";
import type { Database } from "@/types/database.types";

type SettingsUpdate = Database["public"]["Tables"]["settings"]["Update"];

export async function getSettings() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("settings").select("*").eq("workspace_id", DEFAULT_WORKSPACE_ID).single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function updateSettings(input: SettingsUpdate) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("settings")
    .update(input)
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}
