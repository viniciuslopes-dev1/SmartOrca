import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || z.string().email().safeParse(value).success, "Email inválido.");

const money = z.number().min(0, "Informe um valor maior ou igual a zero.");

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome ou razão social."),
  person_type: z.enum(["individual", "company"]),
  document: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  email: optionalEmail,
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  is_active: z.boolean()
});

export const projectSchema = z
  .object({
    client_id: z.string().uuid("Selecione um cliente."),
    name: z.string().trim().min(2, "Informe o nome da obra/projeto."),
    service_type: z.string().trim().optional().or(z.literal("")),
    address: z.string().trim().optional().or(z.literal("")),
    city: z.string().trim().optional().or(z.literal("")),
    state: z.string().trim().optional().or(z.literal("")),
    expected_start_date: z.string().optional().or(z.literal("")),
    expected_end_date: z.string().optional().or(z.literal("")),
    status: z.enum(["planning", "estimating", "waiting_approval", "approved", "in_progress", "finished", "cancelled"]),
    description: z.string().trim().optional().or(z.literal("")),
    notes: z.string().trim().optional().or(z.literal(""))
  })
  .refine(
    (data) => !data.expected_start_date || !data.expected_end_date || data.expected_end_date >= data.expected_start_date,
    {
      path: ["expected_end_date"],
      message: "A data final deve ser maior ou igual à data inicial."
    }
  );

export const catalogItemSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do item."),
  description: z.string().trim().optional().or(z.literal("")),
  type: z.enum(["product", "service", "labor", "material", "equipment", "fee_other"]),
  unit: z.enum(["unit", "m2", "m3", "linear_meter", "hour", "day", "kg", "package", "other"]),
  category: z.string().trim().optional().or(z.literal("")),
  cost_unit: money,
  price_unit: money,
  default_margin: money,
  is_active: z.boolean(),
  notes: z.string().trim().optional().or(z.literal(""))
});

export const budgetItemSchema = z.object({
  id: z.string().optional(),
  group_id: z.string().uuid().nullable().optional(),
  catalog_item_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1, "Informe o nome do item."),
  description: z.string().trim().optional().or(z.literal("")),
  type: z.string().trim().optional().or(z.literal("")),
  unit: z.string().trim().min(1, "Informe a unidade."),
  quantity: z.number().positive("A quantidade deve ser maior que zero."),
  cost_unit: money,
  price_unit: money,
  discount: money,
  margin: money,
  subtotal: money,
  sort_order: z.number().int().min(0),
  notes: z.string().trim().optional().or(z.literal(""))
});

export const budgetGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Informe o nome do grupo."),
  type: z.enum(["labor", "material", "service", "product", "stage", "other"]),
  sort_order: z.number().int().min(0),
  subtotal: money,
  notes: z.string().trim().optional().or(z.literal("")),
  items: z.array(budgetItemSchema).min(1, "Inclua ao menos um item neste grupo.")
});

export const budgetSchema = z
  .object({
    client_id: z.string().uuid("Selecione um cliente."),
    project_id: z.string().uuid().nullable().optional().or(z.literal("")),
    title: z.string().trim().min(2, "Informe um título."),
    description: z.string().trim().optional().or(z.literal("")),
    issue_date: z.string().min(1, "Informe a data de emissão."),
    valid_until: z.string().optional().or(z.literal("")),
    execution_deadline: z.string().trim().optional().or(z.literal("")),
    payment_terms: z.string().trim().optional().or(z.literal("")),
    included_scope: z.string().trim().optional().or(z.literal("")),
    excluded_scope: z.string().trim().optional().or(z.literal("")),
    customer_notes: z.string().trim().optional().or(z.literal("")),
    internal_notes: z.string().trim().optional().or(z.literal("")),
    discount_total: money,
    tax_total: money,
    budget_layout: z.enum(["classic", "modern", "compact", "detailed", "corporate", "premium", "technical", "minimal"]).optional(),
    status: z.enum(["draft", "sent", "approved", "rejected", "expired", "cancelled"]),
    groups: z.array(budgetGroupSchema).min(1, "Inclua ao menos um grupo no orçamento.")
  })
  .refine((data) => !data.valid_until || data.valid_until >= data.issue_date, {
    path: ["valid_until"],
    message: "A validade não pode ser anterior à emissão."
  });

export type ClientFormValues = z.infer<typeof clientSchema>;
export type ProjectFormValues = z.infer<typeof projectSchema>;
export type CatalogItemFormValues = z.infer<typeof catalogItemSchema>;
export type BudgetFormValues = z.infer<typeof budgetSchema>;
export type BudgetItemFormValues = z.infer<typeof budgetItemSchema>;
export type BudgetGroupFormValues = z.infer<typeof budgetGroupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe o email.").email("Email inválido."),
  password: z.string().min(1, "Informe a senha.")
});

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Informe seu nome."),
    email: z.string().trim().min(1, "Informe o email.").email("Email inválido."),
    phone: z.string().trim().optional().or(z.literal("")),
    workspace_name: z.string().trim().min(2, "Informe o nome da empresa/workspace."),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    password_confirmation: z.string().min(8, "Confirme a senha.")
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "As senhas não conferem."
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Informe o email.").email("Email inválido.")
});

export const workspaceOnboardingSchema = z.object({
  workspace_name: z.string().trim().min(2, "Informe o nome da empresa/workspace."),
  phone: z.string().trim().optional().or(z.literal(""))
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type WorkspaceOnboardingFormValues = z.infer<typeof workspaceOnboardingSchema>;
