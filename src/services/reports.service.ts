import { DEFAULT_WORKSPACE_ID } from "@/lib/constants/workspace";
import { asNumber } from "@/lib/formatters";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeSupabaseError } from "@/services/service-error";
import type { BudgetListItem, BudgetStatus, ProjectWithClient } from "@/types/database.types";

export type DashboardMetrics = {
  totalClients: number;
  totalProjects: number;
  totalBudgets: number;
  draftBudgets: number;
  sentBudgets: number;
  approvedBudgets: number;
  rejectedBudgets: number;
  totalQuoted: number;
  totalApproved: number;
  approvalRate: number;
};

export async function getDashboardData() {
  const supabase = getSupabaseClient();
  const [clients, projects, budgets, recentBudgets, recentProjects] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("workspace_id", DEFAULT_WORKSPACE_ID),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", DEFAULT_WORKSPACE_ID),
    supabase.from("budgets").select("status,total").eq("workspace_id", DEFAULT_WORKSPACE_ID),
    supabase
      .from("budgets")
      .select("*, clients(id, name), projects(id, name)")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("projects")
      .select("*, clients(id, name)")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
      .order("created_at", { ascending: false })
      .limit(6)
  ]);

  if (clients.error) throw normalizeSupabaseError(clients.error);
  if (projects.error) throw normalizeSupabaseError(projects.error);
  if (budgets.error) throw normalizeSupabaseError(budgets.error);
  if (recentBudgets.error) throw normalizeSupabaseError(recentBudgets.error);
  if (recentProjects.error) throw normalizeSupabaseError(recentProjects.error);

  const rows = budgets.data ?? [];
  const statusCount = (status: BudgetStatus) => rows.filter((budget) => budget.status === status).length;
  const approved = rows.filter((budget) => budget.status === "approved");
  const metrics: DashboardMetrics = {
    totalClients: clients.count ?? 0,
    totalProjects: projects.count ?? 0,
    totalBudgets: rows.length,
    draftBudgets: statusCount("draft"),
    sentBudgets: statusCount("sent"),
    approvedBudgets: statusCount("approved"),
    rejectedBudgets: statusCount("rejected"),
    totalQuoted: rows.reduce((sum, budget) => sum + asNumber(budget.total), 0),
    totalApproved: approved.reduce((sum, budget) => sum + asNumber(budget.total), 0),
    approvalRate: rows.length ? Math.round((approved.length / rows.length) * 100) : 0
  };

  return {
    metrics,
    recentBudgets: (recentBudgets.data ?? []) as unknown as BudgetListItem[],
    recentProjects: (recentProjects.data ?? []) as unknown as ProjectWithClient[]
  };
}

export async function getReportsData() {
  const supabase = getSupabaseClient();
  const [budgets, items] = await Promise.all([
    supabase.from("budgets").select("*, clients(id, name), projects(id, name)").eq("workspace_id", DEFAULT_WORKSPACE_ID),
    supabase.from("budget_items").select("name, quantity, subtotal, budgets!inner(workspace_id)").eq("budgets.workspace_id", DEFAULT_WORKSPACE_ID)
  ]);

  if (budgets.error) throw normalizeSupabaseError(budgets.error);
  if (items.error) throw normalizeSupabaseError(items.error);

  const budgetRows = (budgets.data ?? []) as unknown as BudgetListItem[];
  const statusTotals = Object.values(
    budgetRows.reduce<Record<string, { status: string; total: number; count: number }>>((acc, budget) => {
      acc[budget.status] ??= { status: budget.status, total: 0, count: 0 };
      acc[budget.status].total += asNumber(budget.total);
      acc[budget.status].count += 1;
      return acc;
    }, {})
  );

  const topClients = Object.values(
    budgetRows.reduce<Record<string, { client: string; total: number; count: number }>>((acc, budget) => {
      const key = budget.clients?.name ?? "Sem cliente";
      acc[key] ??= { client: key, total: 0, count: 0 };
      acc[key].total += asNumber(budget.total);
      acc[key].count += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const mostUsedItems = Object.values(
    (items.data ?? []).reduce<Record<string, { item: string; quantity: number; total: number }>>((acc, item) => {
      const key = item.name ?? "Item";
      acc[key] ??= { item: key, quantity: 0, total: 0 };
      acc[key].quantity += asNumber(item.quantity);
      acc[key].total += asNumber(item.subtotal);
      return acc;
    }, {})
  )
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);

  const approved = budgetRows.filter((budget) => budget.status === "approved");
  const totalQuoted = budgetRows.reduce((sum, budget) => sum + asNumber(budget.total), 0);

  return {
    statusTotals,
    topClients,
    mostUsedItems,
    totalQuoted,
    totalApproved: approved.reduce((sum, budget) => sum + asNumber(budget.total), 0),
    averageTicket: budgetRows.length ? totalQuoted / budgetRows.length : 0,
    openProjects: budgetRows.filter((budget) => ["draft", "sent"].includes(budget.status)).length,
    approvalRate: budgetRows.length ? Math.round((approved.length / budgetRows.length) * 100) : 0
  };
}
