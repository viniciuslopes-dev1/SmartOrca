import type { SaveBudgetInput } from "@/services/budgets.service";
import type { BudgetFormValues } from "@/lib/validations/schemas";

function clean(value: string | null | undefined) {
  return value && value.trim() ? value.trim() : null;
}

export function toSaveBudgetInput(values: BudgetFormValues): SaveBudgetInput {
  return {
    client_id: values.client_id,
    project_id: clean(values.project_id || undefined),
    title: values.title,
    description: clean(values.description),
    issue_date: values.issue_date,
    valid_until: clean(values.valid_until),
    execution_deadline: clean(values.execution_deadline),
    payment_terms: clean(values.payment_terms),
    included_scope: clean(values.included_scope),
    excluded_scope: clean(values.excluded_scope),
    customer_notes: clean(values.customer_notes),
    internal_notes: clean(values.internal_notes),
    discount_total: values.discount_total,
    tax_total: values.tax_total,
    budget_layout: values.budget_layout ?? null,
    status: values.status,
    groups: values.groups.map((group, groupIndex) => ({
      id: group.id,
      name: group.name,
      type: group.type,
      sort_order: groupIndex,
      notes: clean(group.notes),
      items: group.items.map((item) => ({
        catalog_item_id: item.catalog_item_id ?? null,
        name: item.name,
        description: clean(item.description),
        type: clean(item.type),
        unit: item.unit,
        quantity: item.quantity,
        cost_unit: item.cost_unit,
        price_unit: item.price_unit,
        discount: item.discount,
        notes: clean(item.notes)
      }))
    }))
  };
}
