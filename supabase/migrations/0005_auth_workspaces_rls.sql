-- Supabase Auth + workspace membership security model.
-- Run after the initial schema/mvp migrations. This migration replaces the
-- temporary anon/default-workspace MVP policies with authenticated policies.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces
  add column if not exists owner_id uuid references auth.users(id);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  constraint workspace_members_unique unique (workspace_id, user_id)
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_workspaces_owner_id on public.workspaces(owner_id);
create index if not exists idx_workspace_members_workspace_id on public.workspace_members(workspace_id);
create index if not exists idx_workspace_members_user_id on public.workspace_members(user_id);
create index if not exists idx_workspace_members_role on public.workspace_members(role);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
as $$
begin
  insert into public.profiles (id, full_name, email, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        phone = excluded.phone,
        avatar_url = excluded.avatar_url,
        updated_at = now();

  return new;
end;
$$
language plpgsql
security definer
set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create schema if not exists private;

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
  );
$$
language sql
security definer
set search_path = public;

create or replace function private.has_workspace_role(target_workspace_id uuid, allowed_roles text[])
returns boolean
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
      and role = any(allowed_roles)
  );
$$
language sql
security definer
set search_path = public;

create or replace function public.create_workspace_for_current_user(workspace_name text, workspace_phone text default null)
returns public.workspaces
as $$
declare
  current_user_id uuid := auth.uid();
  created_workspace public.workspaces;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  if workspace_name is null or length(trim(workspace_name)) < 2 then
    raise exception 'Informe o nome da empresa/workspace.';
  end if;

  insert into public.workspaces (name, phone, owner_id)
  values (trim(workspace_name), workspace_phone, current_user_id)
  returning * into created_workspace;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (created_workspace.id, current_user_id, 'owner')
  on conflict (workspace_id, user_id) do nothing;

  insert into public.settings (
    workspace_id,
    company_name,
    company_phone,
    default_budget_validity_days,
    default_payment_terms,
    default_notes
  )
  values (
    created_workspace.id,
    created_workspace.name,
    workspace_phone,
    15,
    '50% na aprovação e 50% na entrega.',
    'Valores sujeitos à validação técnica em campo.'
  )
  on conflict (workspace_id) do nothing;

  return created_workspace;
end;
$$
language plpgsql
security definer
set search_path = public;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.catalog_items to authenticated;
grant select, insert, update, delete on public.budgets to authenticated;
grant select, insert, update, delete on public.budget_items to authenticated;
grant select, insert, update, delete on public.budget_status_history to authenticated;
grant select, insert, update, delete on public.settings to authenticated;
grant select, insert, update, delete on public.budget_exports to authenticated;
grant execute on function public.next_budget_number(uuid) to authenticated;
grant execute on function public.create_workspace_for_current_user(text, text) to authenticated;

revoke all on public.profiles from anon;
revoke all on public.workspaces from anon;
revoke all on public.workspace_members from anon;
revoke all on public.clients from anon;
revoke all on public.projects from anon;
revoke all on public.catalog_items from anon;
revoke all on public.budgets from anon;
revoke all on public.budget_items from anon;
revoke all on public.budget_status_history from anon;
revoke all on public.settings from anon;
revoke all on public.budget_exports from anon;
revoke execute on function public.next_budget_number(uuid) from anon;
revoke execute on function public.create_workspace_for_current_user(text, text) from anon;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
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

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "workspaces_select_member" on public.workspaces;
drop policy if exists "workspaces_insert_owner" on public.workspaces;
drop policy if exists "workspaces_update_admin" on public.workspaces;
drop policy if exists "workspace_members_select_member" on public.workspace_members;
drop policy if exists "workspace_members_insert_admin" on public.workspace_members;
drop policy if exists "workspace_members_update_admin" on public.workspace_members;
drop policy if exists "clients_select_member" on public.clients;
drop policy if exists "clients_insert_member" on public.clients;
drop policy if exists "clients_update_member" on public.clients;
drop policy if exists "projects_select_member" on public.projects;
drop policy if exists "projects_insert_member" on public.projects;
drop policy if exists "projects_update_member" on public.projects;
drop policy if exists "catalog_items_select_member" on public.catalog_items;
drop policy if exists "catalog_items_insert_member" on public.catalog_items;
drop policy if exists "catalog_items_update_member" on public.catalog_items;
drop policy if exists "budgets_select_member" on public.budgets;
drop policy if exists "budgets_insert_member" on public.budgets;
drop policy if exists "budgets_update_member" on public.budgets;
drop policy if exists "budgets_delete_member" on public.budgets;
drop policy if exists "budget_items_select_member" on public.budget_items;
drop policy if exists "budget_items_insert_member" on public.budget_items;
drop policy if exists "budget_items_update_member" on public.budget_items;
drop policy if exists "budget_items_delete_member" on public.budget_items;
drop policy if exists "budget_status_history_select_member" on public.budget_status_history;
drop policy if exists "budget_status_history_insert_member" on public.budget_status_history;
drop policy if exists "settings_select_member" on public.settings;
drop policy if exists "settings_update_admin" on public.settings;
drop policy if exists "budget_exports_select_member" on public.budget_exports;
drop policy if exists "budget_exports_insert_member" on public.budget_exports;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "workspaces_select_member"
on public.workspaces for select
to authenticated
using (private.is_workspace_member(id));

create policy "workspaces_insert_owner"
on public.workspaces for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "workspaces_update_admin"
on public.workspaces for update
to authenticated
using (private.has_workspace_role(id, array['owner', 'admin']))
with check (private.has_workspace_role(id, array['owner', 'admin']));

create policy "workspace_members_select_member"
on public.workspace_members for select
to authenticated
using (user_id = (select auth.uid()) or private.is_workspace_member(workspace_id));

create policy "workspace_members_insert_admin"
on public.workspace_members for insert
to authenticated
with check (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "workspace_members_update_admin"
on public.workspace_members for update
to authenticated
using (private.has_workspace_role(workspace_id, array['owner', 'admin']))
with check (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "clients_select_member"
on public.clients for select
to authenticated
using (private.is_workspace_member(workspace_id));

create policy "clients_insert_member"
on public.clients for insert
to authenticated
with check (private.is_workspace_member(workspace_id));

create policy "clients_update_member"
on public.clients for update
to authenticated
using (private.is_workspace_member(workspace_id))
with check (private.is_workspace_member(workspace_id));

create policy "projects_select_member"
on public.projects for select
to authenticated
using (private.is_workspace_member(workspace_id));

create policy "projects_insert_member"
on public.projects for insert
to authenticated
with check (private.is_workspace_member(workspace_id));

create policy "projects_update_member"
on public.projects for update
to authenticated
using (private.is_workspace_member(workspace_id))
with check (private.is_workspace_member(workspace_id));

create policy "catalog_items_select_member"
on public.catalog_items for select
to authenticated
using (private.is_workspace_member(workspace_id));

create policy "catalog_items_insert_member"
on public.catalog_items for insert
to authenticated
with check (private.is_workspace_member(workspace_id));

create policy "catalog_items_update_member"
on public.catalog_items for update
to authenticated
using (private.is_workspace_member(workspace_id))
with check (private.is_workspace_member(workspace_id));

create policy "budgets_select_member"
on public.budgets for select
to authenticated
using (private.is_workspace_member(workspace_id));

create policy "budgets_insert_member"
on public.budgets for insert
to authenticated
with check (private.is_workspace_member(workspace_id));

create policy "budgets_update_member"
on public.budgets for update
to authenticated
using (private.is_workspace_member(workspace_id))
with check (private.is_workspace_member(workspace_id));

create policy "budgets_delete_member"
on public.budgets for delete
to authenticated
using (private.is_workspace_member(workspace_id));

create policy "budget_items_select_member"
on public.budget_items for select
to authenticated
using (
  exists (
    select 1 from public.budgets b
    where b.id = budget_items.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
);

create policy "budget_items_insert_member"
on public.budget_items for insert
to authenticated
with check (
  exists (
    select 1 from public.budgets b
    where b.id = budget_items.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
);

create policy "budget_items_update_member"
on public.budget_items for update
to authenticated
using (
  exists (
    select 1 from public.budgets b
    where b.id = budget_items.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
)
with check (
  exists (
    select 1 from public.budgets b
    where b.id = budget_items.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
);

create policy "budget_items_delete_member"
on public.budget_items for delete
to authenticated
using (
  exists (
    select 1 from public.budgets b
    where b.id = budget_items.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
);

create policy "budget_status_history_select_member"
on public.budget_status_history for select
to authenticated
using (
  exists (
    select 1 from public.budgets b
    where b.id = budget_status_history.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
);

create policy "budget_status_history_insert_member"
on public.budget_status_history for insert
to authenticated
with check (
  exists (
    select 1 from public.budgets b
    where b.id = budget_status_history.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
);

create policy "settings_select_member"
on public.settings for select
to authenticated
using (private.is_workspace_member(workspace_id));

create policy "settings_update_admin"
on public.settings for update
to authenticated
using (private.has_workspace_role(workspace_id, array['owner', 'admin']))
with check (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "budget_exports_select_member"
on public.budget_exports for select
to authenticated
using (private.is_workspace_member(workspace_id));

create policy "budget_exports_insert_member"
on public.budget_exports for insert
to authenticated
with check (private.is_workspace_member(workspace_id));
