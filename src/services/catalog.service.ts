import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/services/service-error";
import type { CatalogItem, CatalogItemType, Database } from "@/types/database.types";

type CatalogInsert = Database["public"]["Tables"]["catalog_items"]["Insert"];
type CatalogUpdate = Database["public"]["Tables"]["catalog_items"]["Update"];

export async function listCatalogItems(workspaceId: string, params: { search?: string; type?: CatalogItemType | "all"; activeOnly?: boolean } = {}) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("catalog_items")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`;
    query = query.or(`name.ilike.${term},category.ilike.${term},description.ilike.${term}`);
  }
  if (params.type && params.type !== "all") query = query.eq("type", params.type);
  if (params.activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw normalizeSupabaseError(error);
  return data ?? [];
}

export async function getCatalogItemById(workspaceId: string, id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("catalog_items").select("*").eq("workspace_id", workspaceId).eq("id", id).single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function createCatalogItem(workspaceId: string, input: Omit<CatalogInsert, "workspace_id">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("catalog_items")
    .insert({ ...input, workspace_id: workspaceId })
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function importCatalogItems(workspaceId: string, items: Array<Omit<CatalogInsert, "workspace_id">>) {
  if (items.length === 0) return [];
  const supabase = getSupabaseClient();
  const rows = items.map((item) => ({ ...item, workspace_id: workspaceId }));
  const { data, error } = await supabase.from("catalog_items").insert(rows).select();
  if (error) throw normalizeSupabaseError(error);
  return data ?? [];
}

export async function updateCatalogItem(workspaceId: string, id: string, input: CatalogUpdate) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("catalog_items")
    .update(input)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function deactivateCatalogItem(workspaceId: string, id: string) {
  return updateCatalogItem(workspaceId, id, { is_active: false });
}

export type CatalogInput = Omit<CatalogItem, "id" | "workspace_id" | "created_at" | "updated_at">;
