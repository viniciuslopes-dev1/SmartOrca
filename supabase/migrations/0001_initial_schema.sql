create extension if not exists "pgcrypto";

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  name text not null,
  person_type text not null default 'individual' check (person_type in ('individual', 'company')),
  document text,
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  state text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  client_id uuid not null references public.clients(id),
  name text not null,
  service_type text,
  address text,
  city text,
  state text,
  expected_start_date date,
  expected_end_date date,
  status text not null default 'planning' check (status in ('planning', 'estimating', 'waiting_approval', 'approved', 'in_progress', 'finished', 'cancelled')),
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_date_order check (expected_end_date is null or expected_start_date is null or expected_end_date >= expected_start_date)
);

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  name text not null,
  description text,
  type text not null check (type in ('product', 'service', 'labor', 'material', 'equipment', 'fee_other')),
  unit text not null default 'unit' check (unit in ('unit', 'm2', 'm3', 'linear_meter', 'hour', 'day', 'kg', 'package', 'other')),
  category text,
  cost_unit numeric(14,2) not null default 0 check (cost_unit >= 0),
  price_unit numeric(14,2) not null default 0 check (price_unit >= 0),
  default_margin numeric(8,4) not null default 0 check (default_margin >= 0),
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  client_id uuid not null references public.clients(id),
  project_id uuid references public.projects(id),
  budget_number integer not null,
  title text not null,
  description text,
  issue_date date not null default current_date,
  valid_until date,
  execution_deadline text,
  payment_terms text,
  included_scope text,
  excluded_scope text,
  customer_notes text,
  internal_notes text,
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  discount_total numeric(14,2) not null default 0 check (discount_total >= 0),
  tax_total numeric(14,2) not null default 0 check (tax_total >= 0),
  margin_total numeric(14,2) not null default 0 check (margin_total >= 0),
  total numeric(14,2) not null default 0 check (total >= 0),
  status text not null default 'draft' check (status in ('draft', 'sent', 'approved', 'rejected', 'expired', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_number_unique unique (workspace_id, budget_number),
  constraint budgets_valid_until_check check (valid_until is null or valid_until >= issue_date)
);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  catalog_item_id uuid references public.catalog_items(id),
  name text not null,
  description text,
  type text,
  unit text not null default 'unit',
  quantity numeric(14,4) not null check (quantity > 0),
  cost_unit numeric(14,2) not null default 0 check (cost_unit >= 0),
  price_unit numeric(14,2) not null default 0 check (price_unit >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  margin numeric(14,2) not null default 0 check (margin >= 0),
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_items_discount_lte_gross_check check (discount <= quantity * price_unit)
);

create table if not exists public.budget_status_history (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  old_status text,
  new_status text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  company_name text not null,
  company_document text,
  company_phone text,
  company_email text,
  company_address text,
  default_budget_validity_days integer not null default 15 check (default_budget_validity_days > 0),
  default_payment_terms text,
  default_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint settings_workspace_unique unique (workspace_id)
);

create table if not exists public.budget_exports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  file_name text,
  exported_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_workspaces_updated_at on public.workspaces;
drop trigger if exists set_clients_updated_at on public.clients;
drop trigger if exists set_projects_updated_at on public.projects;
drop trigger if exists set_catalog_items_updated_at on public.catalog_items;
drop trigger if exists set_budgets_updated_at on public.budgets;
drop trigger if exists set_budget_items_updated_at on public.budget_items;
drop trigger if exists set_settings_updated_at on public.settings;

create trigger set_workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
create trigger set_clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger set_projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger set_catalog_items_updated_at before update on public.catalog_items for each row execute function public.set_updated_at();
create trigger set_budgets_updated_at before update on public.budgets for each row execute function public.set_updated_at();
create trigger set_budget_items_updated_at before update on public.budget_items for each row execute function public.set_updated_at();
create trigger set_settings_updated_at before update on public.settings for each row execute function public.set_updated_at();

create or replace function public.next_budget_number(target_workspace_id uuid)
returns integer
language sql
stable
as $$
  select coalesce(max(budget_number), 0) + 1
  from public.budgets
  where workspace_id = target_workspace_id;
$$;

create index if not exists idx_workspaces_created_at on public.workspaces(created_at);
create index if not exists idx_clients_workspace_id on public.clients(workspace_id);
create index if not exists idx_clients_name on public.clients using gin (to_tsvector('portuguese', coalesce(name, '')));
create index if not exists idx_clients_document on public.clients(document);
create index if not exists idx_clients_is_active on public.clients(is_active);
create index if not exists idx_clients_created_at on public.clients(created_at);
create index if not exists idx_projects_workspace_id on public.projects(workspace_id);
create index if not exists idx_projects_client_id on public.projects(client_id);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_created_at on public.projects(created_at);
create index if not exists idx_catalog_items_workspace_id on public.catalog_items(workspace_id);
create index if not exists idx_catalog_items_name on public.catalog_items using gin (to_tsvector('portuguese', coalesce(name, '')));
create index if not exists idx_catalog_items_category on public.catalog_items(category);
create index if not exists idx_catalog_items_type on public.catalog_items(type);
create index if not exists idx_catalog_items_is_active on public.catalog_items(is_active);
create index if not exists idx_budgets_workspace_id on public.budgets(workspace_id);
create index if not exists idx_budgets_client_id on public.budgets(client_id);
create index if not exists idx_budgets_project_id on public.budgets(project_id);
create index if not exists idx_budgets_status on public.budgets(status);
create index if not exists idx_budgets_created_at on public.budgets(created_at);
create index if not exists idx_budgets_budget_number on public.budgets(workspace_id, budget_number);
create index if not exists idx_budget_items_budget_id on public.budget_items(budget_id);
create index if not exists idx_budget_items_catalog_item_id on public.budget_items(catalog_item_id);
create index if not exists idx_budget_items_sort_order on public.budget_items(sort_order);
create index if not exists idx_budget_status_history_budget_id on public.budget_status_history(budget_id);
create index if not exists idx_budget_status_history_created_at on public.budget_status_history(created_at);

comment on table public.workspaces is 'MVP sem login usa um workspace padrão. Antes de produção pública, habilitar RLS e policies por membership de workspace.';
