import { DEFAULT_WORKSPACE_ID } from "@/lib/constants/workspace";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/services/service-error";
import type { Client, Database } from "@/types/database.types";

type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export async function listClients(search = "") {
  const supabase = getSupabaseClient();
  let query = supabase.from("clients").select("*").eq("workspace_id", DEFAULT_WORKSPACE_ID).order("created_at", { ascending: false });

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`name.ilike.${term},document.ilike.${term},phone.ilike.${term},email.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw normalizeSupabaseError(error);
  return data ?? [];
}

export async function getClientById(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("clients").select("*").eq("workspace_id", DEFAULT_WORKSPACE_ID).eq("id", id).single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function createClient(input: Omit<ClientInsert, "workspace_id">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...input, workspace_id: DEFAULT_WORKSPACE_ID })
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function updateClient(id: string, input: ClientUpdate) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .update(input)
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .eq("id", id)
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function deactivateClient(id: string) {
  return updateClient(id, { is_active: false });
}

export async function getClientRelations(id: string) {
  const supabase = getSupabaseClient();
  const [projects, budgets] = await Promise.all([
    supabase.from("projects").select("*").eq("workspace_id", DEFAULT_WORKSPACE_ID).eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("budgets").select("*").eq("workspace_id", DEFAULT_WORKSPACE_ID).eq("client_id", id).order("created_at", { ascending: false })
  ]);

  if (projects.error) throw normalizeSupabaseError(projects.error);
  if (budgets.error) throw normalizeSupabaseError(budgets.error);

  return {
    projects: projects.data ?? [],
    budgets: budgets.data ?? []
  };
}

export type ClientInput = Omit<Client, "id" | "workspace_id" | "created_at" | "updated_at">;
