import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/services/service-error";
import type { Database } from "@/types/database.types";

type SettingsUpdate = Database["public"]["Tables"]["settings"]["Update"];

export async function getSettings(workspaceId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("settings").select("*").eq("workspace_id", workspaceId).single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function updateSettings(workspaceId: string, input: SettingsUpdate) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("settings")
    .update(input)
    .eq("workspace_id", workspaceId)
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}
