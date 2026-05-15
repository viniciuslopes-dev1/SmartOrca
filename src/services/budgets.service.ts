import { calculateBudgetTotals, calculateItemMargin, calculateItemSubtotal } from "@/lib/calculations/budget";
import { DEFAULT_WORKSPACE_ID } from "@/lib/constants/workspace";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/services/service-error";
import type { Budget, BudgetItem, BudgetListItem, BudgetStatus, BudgetWithRelations, Database } from "@/types/database.types";

type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
type BudgetUpdate = Database["public"]["Tables"]["budgets"]["Update"];
type BudgetItemInsert = Database["public"]["Tables"]["budget_items"]["Insert"];

export type SaveBudgetInput = Omit<
  BudgetInsert,
  "id" | "workspace_id" | "budget_number" | "subtotal" | "margin_total" | "total" | "created_at" | "updated_at"
> & {
  budget_number?: number;
  items: Omit<BudgetItemInsert, "id" | "budget_id" | "subtotal" | "margin" | "sort_order" | "created_at" | "updated_at">[];
};

export async function listBudgets(params: { search?: string; status?: BudgetStatus | "all" } = {}) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("budgets")
    .select("*, clients(id, name), projects(id, name)")
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .order("created_at", { ascending: false });

  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term}`);
  }

  if (params.status && params.status !== "all") query = query.eq("status", params.status);

  const { data, error } = await query;
  if (error) throw normalizeSupabaseError(error);
  return (data ?? []) as unknown as BudgetListItem[];
}

export async function getBudgetById(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("budgets")
    .select("*, clients(*), projects(*), budget_items(*)")
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .eq("id", id)
    .single();
  if (error) throw normalizeSupabaseError(error);
  const budget = data as unknown as BudgetWithRelations;
  budget.budget_items = [...(budget.budget_items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return budget;
}

export async function createBudget(input: SaveBudgetInput) {
  const supabase = getSupabaseClient();
  const totals = calculateBudgetTotals({
    items: input.items,
    discount_total: input.discount_total,
    tax_total: input.tax_total
  });
  const budgetNumber = input.budget_number ?? (await getNextBudgetNumber());
  const { items, ...budgetInput } = input;

  const { data: budget, error } = await supabase
    .from("budgets")
    .insert({
      ...budgetInput,
      workspace_id: DEFAULT_WORKSPACE_ID,
      budget_number: budgetNumber,
      subtotal: totals.subtotal,
      discount_total: totals.discount_total,
      tax_total: totals.tax_total,
      margin_total: totals.margin_total,
      total: totals.total
    })
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);

  await replaceBudgetItems(budget.id, items);
  await recordStatusHistory(budget.id, null, budget.status);
  return getBudgetById(budget.id);
}

export async function updateBudget(id: string, input: SaveBudgetInput) {
  const supabase = getSupabaseClient();
  const totals = calculateBudgetTotals({
    items: input.items,
    discount_total: input.discount_total,
    tax_total: input.tax_total
  });
  const current = await getBudgetById(id);
  const { items, budget_number: _budgetNumber, ...budgetInput } = input;

  const { data, error } = await supabase
    .from("budgets")
    .update({
      ...budgetInput,
      subtotal: totals.subtotal,
      discount_total: totals.discount_total,
      tax_total: totals.tax_total,
      margin_total: totals.margin_total,
      total: totals.total
    } satisfies BudgetUpdate)
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .eq("id", id)
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);

  await replaceBudgetItems(id, items);
  if (current.status !== data.status) await recordStatusHistory(id, current.status, data.status);
  return getBudgetById(id);
}

export async function changeBudgetStatus(id: string, status: BudgetStatus, notes?: string) {
  const supabase = getSupabaseClient();
  const current = await getBudgetById(id);
  const { data, error } = await supabase
    .from("budgets")
    .update({ status })
    .eq("workspace_id", DEFAULT_WORKSPACE_ID)
    .eq("id", id)
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  await recordStatusHistory(id, current.status, status, notes);
  return data;
}

export async function duplicateBudget(id: string) {
  const budget = await getBudgetById(id);
  return createBudget({
    client_id: budget.client_id,
    project_id: budget.project_id,
    title: `${budget.title} (cópia)`,
    description: budget.description,
    issue_date: new Date().toISOString().slice(0, 10),
    valid_until: budget.valid_until,
    execution_deadline: budget.execution_deadline,
    payment_terms: budget.payment_terms,
    included_scope: budget.included_scope,
    excluded_scope: budget.excluded_scope,
    customer_notes: budget.customer_notes,
    internal_notes: budget.internal_notes,
    discount_total: budget.discount_total,
    tax_total: budget.tax_total,
    status: "draft",
    items: budget.budget_items.map((item) => ({
      catalog_item_id: item.catalog_item_id,
      name: item.name,
      description: item.description,
      type: item.type,
      unit: item.unit,
      quantity: item.quantity,
      cost_unit: item.cost_unit,
      price_unit: item.price_unit,
      discount: item.discount,
      notes: item.notes
    }))
  });
}

export async function getBudgetStatusHistory(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("budget_status_history")
    .select("*")
    .eq("budget_id", id)
    .order("created_at", { ascending: false });
  if (error) throw normalizeSupabaseError(error);
  return data ?? [];
}

async function getNextBudgetNumber() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("next_budget_number", { target_workspace_id: DEFAULT_WORKSPACE_ID });
  if (error) throw normalizeSupabaseError(error);
  return data;
}

async function replaceBudgetItems(budgetId: string, items: SaveBudgetInput["items"]) {
  const supabase = getSupabaseClient();
  const deletion = await supabase.from("budget_items").delete().eq("budget_id", budgetId);
  if (deletion.error) throw normalizeSupabaseError(deletion.error);

  const rows = items.map((item, index) => ({
    ...item,
    budget_id: budgetId,
    margin: calculateItemMargin(item),
    subtotal: calculateItemSubtotal(item),
    sort_order: index
  }));

  const { error } = await supabase.from("budget_items").insert(rows);
  if (error) throw normalizeSupabaseError(error);
}

async function recordStatusHistory(budgetId: string, oldStatus: BudgetStatus | null, newStatus: BudgetStatus, notes?: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("budget_status_history").insert({
    budget_id: budgetId,
    old_status: oldStatus,
    new_status: newStatus,
    notes: notes ?? null
  });
  if (error) throw normalizeSupabaseError(error);
}

export type BudgetRow = Budget;
export type BudgetItemRow = BudgetItem;
