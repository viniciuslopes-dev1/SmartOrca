-- Ensures the temporary MVP workspace exists when setup is done through SQL Editor
-- without running supabase/seed.sql separately.

insert into public.workspaces (id, name, document, phone, email, address, city, state)
values (
  '00000000-0000-0000-0000-000000000001',
  'Workspace Operacional',
  null,
  null,
  null,
  null,
  null,
  null
)
on conflict (id) do nothing;

insert into public.settings (
  workspace_id,
  company_name,
  company_document,
  company_phone,
  company_email,
  company_address,
  default_budget_validity_days,
  default_payment_terms,
  default_notes
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Minha Empresa',
  null,
  null,
  null,
  null,
  15,
  '50% na aprovação e 50% na entrega.',
  'Valores sujeitos à validação técnica em campo.'
)
on conflict (workspace_id) do nothing;
