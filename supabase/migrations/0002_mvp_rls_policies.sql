-- Temporary MVP policies for the no-login version.
-- These policies allow the browser anon key to use only the default workspace.
-- Before public production, replace this with Supabase Auth + workspace membership policies.

alter table public.workspaces enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.catalog_items enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_items enable row level security;
alter table public.budget_status_history enable row level security;
alter table public.settings enable row level security;
alter table public.budget_exports enable row level security;

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

create policy "mvp_default_workspace_select"
on public.workspaces for select
to anon, authenticated
using (id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_default_workspace_update"
on public.workspaces for update
to anon, authenticated
using (id = '00000000-0000-0000-0000-000000000001')
with check (id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_clients_select"
on public.clients for select
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_clients_insert"
on public.clients for insert
to anon, authenticated
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_clients_update"
on public.clients for update
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_projects_select"
on public.projects for select
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_projects_insert"
on public.projects for insert
to anon, authenticated
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_projects_update"
on public.projects for update
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_catalog_items_select"
on public.catalog_items for select
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_catalog_items_insert"
on public.catalog_items for insert
to anon, authenticated
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_catalog_items_update"
on public.catalog_items for update
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_budgets_select"
on public.budgets for select
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_budgets_insert"
on public.budgets for insert
to anon, authenticated
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_budgets_update"
on public.budgets for update
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_budgets_delete"
on public.budgets for delete
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_budget_items_select"
on public.budget_items for select
to anon, authenticated
using (
  exists (
    select 1 from public.budgets
    where budgets.id = budget_items.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
);

create policy "mvp_budget_items_insert"
on public.budget_items for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.budgets
    where budgets.id = budget_items.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
);

create policy "mvp_budget_items_update"
on public.budget_items for update
to anon, authenticated
using (
  exists (
    select 1 from public.budgets
    where budgets.id = budget_items.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
)
with check (
  exists (
    select 1 from public.budgets
    where budgets.id = budget_items.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
);

create policy "mvp_budget_items_delete"
on public.budget_items for delete
to anon, authenticated
using (
  exists (
    select 1 from public.budgets
    where budgets.id = budget_items.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
);

create policy "mvp_budget_status_history_select"
on public.budget_status_history for select
to anon, authenticated
using (
  exists (
    select 1 from public.budgets
    where budgets.id = budget_status_history.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
);

create policy "mvp_budget_status_history_insert"
on public.budget_status_history for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.budgets
    where budgets.id = budget_status_history.budget_id
    and budgets.workspace_id = '00000000-0000-0000-0000-000000000001'
  )
);

create policy "mvp_settings_select"
on public.settings for select
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_settings_update"
on public.settings for update
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001')
with check (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_budget_exports_select"
on public.budget_exports for select
to anon, authenticated
using (workspace_id = '00000000-0000-0000-0000-000000000001');

create policy "mvp_budget_exports_insert"
on public.budget_exports for insert
to anon, authenticated
with check (workspace_id = '00000000-0000-0000-0000-000000000001');
