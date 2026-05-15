import type { CatalogItemFormValues, ClientFormValues, ProjectFormValues } from "@/lib/validations/schemas";

function clean(value: string | null | undefined) {
  return value && value.trim() ? value.trim() : null;
}

export function normalizeClientInput(values: ClientFormValues) {
  return {
    name: values.name,
    person_type: values.person_type,
    document: clean(values.document),
    phone: clean(values.phone),
    whatsapp: clean(values.whatsapp),
    email: clean(values.email),
    address: clean(values.address),
    city: clean(values.city),
    state: clean(values.state),
    notes: clean(values.notes),
    is_active: values.is_active
  };
}

export function normalizeProjectInput(values: ProjectFormValues) {
  return {
    client_id: values.client_id,
    name: values.name,
    service_type: clean(values.service_type),
    address: clean(values.address),
    city: clean(values.city),
    state: clean(values.state),
    expected_start_date: clean(values.expected_start_date),
    expected_end_date: clean(values.expected_end_date),
    status: values.status,
    description: clean(values.description),
    notes: clean(values.notes)
  };
}

export function normalizeCatalogItemInput(values: CatalogItemFormValues) {
  return {
    name: values.name,
    description: clean(values.description),
    type: values.type,
    unit: values.unit,
    category: clean(values.category),
    cost_unit: values.cost_unit,
    price_unit: values.price_unit,
    default_margin: values.default_margin,
    is_active: values.is_active,
    notes: clean(values.notes)
  };
}
