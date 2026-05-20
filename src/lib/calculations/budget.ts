import { asNumber } from "@/lib/formatters";

export type BudgetCalculationItem = {
  quantity: number | string;
  price_unit: number | string;
  cost_unit?: number | string | null;
  discount?: number | string | null;
};

export type BudgetTotalsInput = {
  items: BudgetCalculationItem[];
  discount_total?: number | string | null;
  tax_total?: number | string | null;
};

export type BudgetCalculationGroup = {
  items: BudgetCalculationItem[];
};

export type GroupedBudgetTotalsInput = {
  groups: BudgetCalculationGroup[];
  discount_total?: number | string | null;
  tax_total?: number | string | null;
};

export function calculateItemSubtotal(item: BudgetCalculationItem) {
  const gross = asNumber(item.quantity) * asNumber(item.price_unit);
  const discount = Math.min(asNumber(item.discount), gross);
  return roundMoney(Math.max(gross - discount, 0));
}

export function calculateItemMargin(item: BudgetCalculationItem) {
  const revenue = calculateItemSubtotal(item);
  const cost = asNumber(item.quantity) * asNumber(item.cost_unit);
  return roundMoney(Math.max(revenue - cost, 0));
}

export function calculateBudgetTotals(input: BudgetTotalsInput) {
  const subtotal = roundMoney(input.items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0));
  const margin_total = roundMoney(input.items.reduce((sum, item) => sum + calculateItemMargin(item), 0));
  const discount_total = Math.min(asNumber(input.discount_total), subtotal);
  const tax_total = asNumber(input.tax_total);
  const total = roundMoney(Math.max(subtotal - discount_total + tax_total, 0));

  return {
    subtotal,
    discount_total: roundMoney(discount_total),
    tax_total: roundMoney(tax_total),
    margin_total,
    total
  };
}

export function calculateGroupSubtotal(group: BudgetCalculationGroup) {
  return roundMoney(group.items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0));
}

export function flattenBudgetGroups(groups: BudgetCalculationGroup[]) {
  return groups.flatMap((group) => group.items);
}

export function calculateGroupedBudgetTotals(input: GroupedBudgetTotalsInput) {
  return calculateBudgetTotals({
    items: flattenBudgetGroups(input.groups),
    discount_total: input.discount_total,
    tax_total: input.tax_total
  });
}

export function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
