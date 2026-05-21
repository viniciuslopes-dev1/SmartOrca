import { calculateGroupedBudgetTotals, calculateGroupSubtotal, calculateItemMargin, calculateItemSubtotal } from "@/lib/calculations/budget";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/services/service-error";
import type { Budget, BudgetGroup, BudgetGroupType, BudgetGroupWithItems, BudgetItem, BudgetListItem, BudgetStatus, BudgetWithRelations, Database } from "@/types/database.types";

type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
type BudgetUpdate = Database["public"]["Tables"]["budgets"]["Update"];
type BudgetGroupInsert = Database["public"]["Tables"]["budget_groups"]["Insert"];
type BudgetItemInsert = Database["public"]["Tables"]["budget_items"]["Insert"];
type SaveBudgetItemInput = Omit<BudgetItemInsert, "id" | "budget_id" | "group_id" | "subtotal" | "margin" | "sort_order" | "created_at" | "updated_at">;
type SaveBudgetGroupInput = {
  id?: string;
  name: string;
  type: BudgetGroupType;
  sort_order?: number;
  notes?: string | null;
  items: SaveBudgetItemInput[];
};

export type SaveBudgetInput = Omit<
  BudgetInsert,
  "id" | "workspace_id" | "budget_number" | "subtotal" | "margin_total" | "total" | "created_at" | "updated_at"
> & {
  budget_number?: number;
  groups: SaveBudgetGroupInput[];
};

export async function listBudgets(workspaceId: string, params: { search?: string; status?: BudgetStatus | "all" } = {}) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("budgets")
    .select("*, clients(id, name), projects(id, name)")
    .eq("workspace_id", workspaceId)
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

export async function getBudgetById(workspaceId: string, id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("budgets")
    .select("*, clients(*), projects(*), budget_items(*), budget_groups(*, budget_items(*))")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .single();
  if (error) throw normalizeSupabaseError(error);
  const budget = normalizeBudgetRelations(data as unknown as BudgetWithRelations);
  budget.budget_items = [...(budget.budget_items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return budget;
}

export async function createBudget(workspaceId: string, input: SaveBudgetInput) {
  const supabase = getSupabaseClient();
  const totals = calculateGroupedBudgetTotals({
    groups: input.groups,
    discount_total: input.discount_total,
    tax_total: input.tax_total
  });
  const budgetNumber = input.budget_number ?? (await getNextBudgetNumber(workspaceId));
  const { groups, ...budgetInput } = input;

  const { data: budget, error } = await supabase
    .from("budgets")
    .insert({
      ...budgetInput,
      workspace_id: workspaceId,
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

  await replaceBudgetGroups(budget.id, groups);
  await recordStatusHistory(budget.id, null, budget.status);
  return getBudgetById(workspaceId, budget.id);
}

export async function updateBudget(workspaceId: string, id: string, input: SaveBudgetInput) {
  const supabase = getSupabaseClient();
  const totals = calculateGroupedBudgetTotals({
    groups: input.groups,
    discount_total: input.discount_total,
    tax_total: input.tax_total
  });
  const current = await getBudgetById(workspaceId, id);
  const { groups, budget_number: _budgetNumber, ...budgetInput } = input;

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
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);

  await replaceBudgetGroups(id, groups);
  if (current.status !== data.status) await recordStatusHistory(id, current.status, data.status);
  return getBudgetById(workspaceId, id);
}

export async function changeBudgetStatus(workspaceId: string, id: string, status: BudgetStatus, notes?: string) {
  const supabase = getSupabaseClient();
  const current = await getBudgetById(workspaceId, id);
  const { data, error } = await supabase
    .from("budgets")
    .update({ status })
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  await recordStatusHistory(id, current.status, status, notes);
  return data;
}

export async function duplicateBudget(workspaceId: string, id: string) {
  const budget = await getBudgetById(workspaceId, id);
  return createBudget(workspaceId, {
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
    budget_layout: budget.budget_layout,
    status: "draft",
    groups: getBudgetGroups(budget).map((group, groupIndex) => ({
      name: group.name,
      type: group.type,
      sort_order: groupIndex,
      notes: group.notes,
      items: group.budget_items.map((item) => ({
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

async function getNextBudgetNumber(workspaceId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("next_budget_number", { target_workspace_id: workspaceId });
  if (error) throw normalizeSupabaseError(error);
  return data;
}

async function replaceBudgetGroups(budgetId: string, groups: SaveBudgetInput["groups"]) {
  const supabase = getSupabaseClient();
  const itemDeletion = await supabase.from("budget_items").delete().eq("budget_id", budgetId);
  if (itemDeletion.error) throw normalizeSupabaseError(itemDeletion.error);

  const groupDeletion = await supabase.from("budget_groups").delete().eq("budget_id", budgetId);
  if (groupDeletion.error) throw normalizeSupabaseError(groupDeletion.error);

  const groupRows: BudgetGroupInsert[] = groups.map((group, index) => ({
    budget_id: budgetId,
    name: group.name,
    type: group.type,
    sort_order: group.sort_order ?? index,
    subtotal: calculateGroupSubtotal(group),
    notes: group.notes ?? null
  }));

  const { data: insertedGroups, error: groupError } = await supabase.from("budget_groups").insert(groupRows).select();
  if (groupError) throw normalizeSupabaseError(groupError);

  const sortedGroups = [...((insertedGroups ?? []) as BudgetGroup[])].sort((a, b) => a.sort_order - b.sort_order);
  const itemRows = groups.flatMap((group, groupIndex) => {
    const insertedGroup = sortedGroups[groupIndex];
    if (!insertedGroup) return [];
    return group.items.map((item, itemIndex) => ({
      ...item,
      budget_id: budgetId,
      group_id: insertedGroup.id,
      margin: calculateItemMargin(item),
      subtotal: calculateItemSubtotal(item),
      sort_order: itemIndex
    }));
  });

  if (itemRows.length === 0) return;

  const { error } = await supabase.from("budget_items").insert(itemRows);
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

function normalizeBudgetRelations(budget: BudgetWithRelations) {
  const groups = getBudgetGroups(budget);
  return {
    ...budget,
    budget_groups: groups,
    budget_items: groups.flatMap((group) => group.budget_items)
  } satisfies BudgetWithRelations;
}

export function getBudgetGroups(budget: BudgetWithRelations): BudgetGroupWithItems[] {
  const relationGroups = [...(budget.budget_groups ?? [])]
    .map((group) => ({
      ...group,
      budget_items: [...(group.budget_items ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    }))
    .sort((a, b) => a.sort_order - b.sort_order);

  if (relationGroups.length > 0) return relationGroups;

  return [
    {
      id: "legacy-items",
      budget_id: budget.id,
      name: "Itens do orçamento",
      type: "service" as BudgetGroupType,
      sort_order: 0,
      subtotal: budget.subtotal,
      notes: null,
      created_at: budget.created_at,
      updated_at: budget.updated_at,
      budget_items: [...(budget.budget_items ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    }
  ];
}
