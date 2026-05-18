import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/services/service-error";
import type { Database, ProjectStatus, ProjectWithClient } from "@/types/database.types";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export async function listProjects(workspaceId: string, params: { search?: string; clientId?: string; status?: ProjectStatus | "all" } = {}) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("projects")
    .select("*, clients(id, name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`;
    query = query.or(`name.ilike.${term},service_type.ilike.${term},city.ilike.${term}`);
  }

  if (params.clientId) query = query.eq("client_id", params.clientId);
  if (params.status && params.status !== "all") query = query.eq("status", params.status);

  const { data, error } = await query;
  if (error) throw normalizeSupabaseError(error);
  return (data ?? []) as unknown as ProjectWithClient[];
}

export async function getProjectById(workspaceId: string, id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(id, name)")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data as unknown as ProjectWithClient;
}

export async function createProject(workspaceId: string, input: Omit<ProjectInsert, "workspace_id">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...input, workspace_id: workspaceId })
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function updateProject(workspaceId: string, id: string, input: ProjectUpdate) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .update(input)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function getProjectBudgets(workspaceId: string, projectId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("budgets")
    .select("*, clients(id, name)")
    .eq("workspace_id", workspaceId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw normalizeSupabaseError(error);
  return data ?? [];
}
