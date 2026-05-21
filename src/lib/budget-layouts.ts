import type { BudgetLayoutId } from "@/types/database.types";

export type BudgetLayoutDefinition = {
  id: BudgetLayoutId;
  name: string;
  description: string;
};

export const DEFAULT_BUDGET_LAYOUT: BudgetLayoutId = "classic";

export const BUDGET_LAYOUTS: BudgetLayoutDefinition[] = [
  { id: "classic", name: "Proposta comercial", description: "Capa, cabecalho centralizado, tabelas por setor, rodape e assinatura." }
];

const BUDGET_LAYOUT_IDS = new Set<BudgetLayoutId>(BUDGET_LAYOUTS.map((layout) => layout.id));

export function resolveBudgetLayoutId(layout?: string | null): BudgetLayoutId {
  if (layout && BUDGET_LAYOUT_IDS.has(layout as BudgetLayoutId)) return layout as BudgetLayoutId;
  return DEFAULT_BUDGET_LAYOUT;
}

export function getBudgetLayoutDefinition(layout?: string | null) {
  const resolved = resolveBudgetLayoutId(layout);
  return BUDGET_LAYOUTS.find((entry) => entry.id === resolved) ?? BUDGET_LAYOUTS[0];
}

