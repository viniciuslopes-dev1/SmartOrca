-- One-shot MVP access setup for the no-login version.
-- Run this after 0001_initial_schema.sql.
--
-- This is intentionally permissive for the fixed default workspace only:
-- 00000000-0000-0000-0000-000000000001
--
-- Before public production, replace these policies with Supabase Auth +
-- workspace membership policies. Do not use this policy set as a real SaaS
-- multi-tenant security model.

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

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.workspaces to anon, authenticated;
grant select, insert, update, delete on table public.clients to anon, authenticated;
grant select, insert, update, delete on table public.projects to anon, authenticated;
grant select, insert, update, delete on table public.catalog_items to anon, authenticated;
grant select, insert, update, delete on table public.budgets to anon, authenticated;
grant select, insert, update, delete on table public.budget_items to anon, authenticated;
grant select, insert, update, delete on table public.budget_status_history to anon, authenticated;
grant select, insert, update, delete on table public.settings to anon, authenticated;
grant select, insert, update, delete on table public.budget_exports to anon, authenticated;
grant execute on function public.next_budget_number(uuid) to anon, authenticated;

alter table public.workspaces enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.catalog_items enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_items enable row level security;
alter table public.budget_status_history enable row level security;
alter table public.settings enable row level security;
alter table public.budget_exports enable row level security;

drop policy if exists "mvp_workspaces_all" on public.workspaces;
drop policy if exists "mvp_clients_all" on public.clients;
drop policy if exists "mvp_projects_all" on public.projects;
drop policy if exists "mvp_catalog_items_all" on public.catalog_items;
drop policy if exists "mvp_budgets_all" on public.budgets;
drop policy if exists "mvp_budget_items_all" on public.budget_items;
drop policy if exists "mvp_budget_status_history_all" on public.budget_status_history;
drop policy if exists "mvp_settings_all" on public.settings;
drop policy if exists "mvp_budget_exports_all" on public.budget_exports;

-- Drop older split policies if they were already created while troubleshooting.
drop policy if exists "mvp_default_workspace_select" on public.workspaces;
drop policy if exists "mvp_default_workspace_update" on public.workspaces;
drop policy if exists "mvp_clients_select" on public.clients;
drop policy if exists "mvp_clients_insert" on public.clients;
drop policy if exists "mvp_clients_update" on public.clients;
drop policy if exists "mvp_projects_select" on public.projects;
drop policy if exists "mvp_projects_insert" on public.projects;
drop policy if exists "mvp_projects_update" on public.projects;
drop policy if exists "mvp_catalog_items_select" on public.catalog_items;
drop policy if exists "mvp_catalog_items_insert" on public.catalog_items;
drop policy if exists "mvp_catalog_items_update" on public.catalog_items;
drop policy if exists "mvp_budgets_select" on public.budgets;
drop policy if exists "mvp_budgets_insert" on public.budgets;
drop policy if exists "mvp_budgets_update" on public.budgets;
drop policy if exists "mvp_budgets_delete" on public.budgets;
drop policy if exists "mvp_budget_items_select" on public.budget_items;
drop policy if exists "mvp_budget_items_insert" on public.budget_items;
drop policy if exists "mvp_budget_items_update" on public.budget_items;
drop policy if exists "mvp_budget_items_delete" on public.budget_items;
drop policy if exists "mvp_budget_status_history_select" on public.budget_status_history;
drop policy if exists "mvp_budget_status_history_insert" on public.budget_status_history;
drop policy if exists "mvp_settings_select" on public.settings;
drop policy if exists "mvp_settings_update" on public.settings;
drop policy if exists "mvp_budget_exports_select" on public.budget_exports;
drop policy if exists "mvp_budget_exports_insert" on public.budget_exports;

create policy "mvp_workspaces_all"
on public.workspaces
for all
to anon, authenticated
using (id = '00000000-0000-0000-0000-000000000001')
with check (id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_clients_all"
on public.clients
for all
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_projects_all"
on public.projects
for all
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_catalog_items_all"
on public.catalog_items
for all
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_budgets_all"
on public.budgets
for all
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_budget_items_all"
on public.budget_items
for all
to anon, authenticated
using (
  exists (
    select 1
    from public.budgets
    where budgets.id = budget_items.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
)
with check (
  exists (
    select 1
    from public.budgets
    where budgets.id = budget_items.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
);

create policy "mvp_budget_status_history_all"
on public.budget_status_history
for all
to anon, authenticated
using (
  exists (
    select 1
    from public.budgets
    where budgets.id = budget_status_history.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
)
with check (
  exists (
    select 1
    from public.budgets
    where budgets.id = budget_status_history.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
);

create policy "mvp_settings_all"
on public.settings
for all
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_budget_exports_all"
on public.budget_exports
for all
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');
