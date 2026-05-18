import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/services/service-error";
import type { WorkspaceMembership } from "@/types/database.types";

export async function listWorkspaceMemberships() {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError) throw normalizeSupabaseError(userError);
  if (!user) return [];

  const { data, error } = await supabase
    .from("workspace_members")
    .select("*, workspaces(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (error) throw normalizeSupabaseError(error);
  return (data ?? []) as unknown as WorkspaceMembership[];
}

export async function getCurrentWorkspace() {
  const memberships = await listWorkspaceMemberships();
  return memberships.find((membership) => membership.workspaces) ?? null;
}

export async function createWorkspaceForCurrentUser(input: { workspace_name: string; phone?: string | null }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_workspace_for_current_user", {
    workspace_name: input.workspace_name,
    workspace_phone: input.phone ?? null
  });
  if (error) throw normalizeSupabaseError(error);
  return data;
}
