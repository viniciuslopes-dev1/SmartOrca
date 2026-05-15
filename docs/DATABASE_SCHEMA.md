# Database Schema

## Diretrizes

- Banco principal: Supabase Postgres.
- Schema inicial: `public`.
- Todas as tabelas de negócio usam `uuid` como PK.
- Todas as tabelas principais usam `workspace_id`.
- Tabelas com atualização usam `created_at` e `updated_at`.
- Exclusão destrutiva deve ser evitada nos cadastros principais.
- Preparar RLS para fase com autenticação.

## Tipos controlados

Usar `check constraints` ou enums SQL para:

- `person_type`: `individual`, `company`.
- `project_status`: `planning`, `estimating`, `waiting_approval`, `approved`, `in_progress`, `finished`, `cancelled`.
- `catalog_item_type`: `product`, `service`, `labor`, `material`, `equipment`, `fee_other`.
- `catalog_unit`: `unit`, `m2`, `m3`, `linear_meter`, `hour`, `day`, `kg`, `package`, `other`.
- `budget_status`: `draft`, `sent`, `approved`, `rejected`, `expired`, `cancelled`.

## `workspaces`

Campos:

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `document text`
- `phone text`
- `email text`
- `address text`
- `city text`
- `state text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Índices:

- `idx_workspaces_created_at`

Observação:

- No MVP haverá um workspace padrão em seed.

## `clients`

Campos:

- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references workspaces(id)`
- `name text not null`
- `person_type text not null default 'individual'`
- `document text`
- `phone text`
- `whatsapp text`
- `email text`
- `address text`
- `city text`
- `state text`
- `notes text`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- `person_type in ('individual', 'company')`

Índices:

- `idx_clients_workspace_id`
- `idx_clients_name`
- `idx_clients_document`
- `idx_clients_is_active`
- `idx_clients_created_at`

## `projects`

Campos:

- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references workspaces(id)`
- `client_id uuid not null references clients(id)`
- `name text not null`
- `service_type text`
- `address text`
- `city text`
- `state text`
- `expected_start_date date`
- `expected_end_date date`
- `status text not null default 'planning'`
- `description text`
- `notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- `status in ('planning', 'estimating', 'waiting_approval', 'approved', 'in_progress', 'finished', 'cancelled')`
- `expected_end_date is null or expected_start_date is null or expected_end_date >= expected_start_date`

Índices:

- `idx_projects_workspace_id`
- `idx_projects_client_id`
- `idx_projects_status`
- `idx_projects_created_at`

## `catalog_items`

Campos:

- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references workspaces(id)`
- `name text not null`
- `description text`
- `type text not null`
- `unit text not null default 'unit'`
- `category text`
- `cost_unit numeric(14,2) not null default 0`
- `price_unit numeric(14,2) not null default 0`
- `default_margin numeric(8,4) not null default 0`
- `is_active boolean not null default true`
- `notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- `cost_unit >= 0`
- `price_unit >= 0`
- `default_margin >= 0`
- `type in ('product', 'service', 'labor', 'material', 'equipment', 'fee_other')`
- `unit in ('unit', 'm2', 'm3', 'linear_meter', 'hour', 'day', 'kg', 'package', 'other')`

Índices:

- `idx_catalog_items_workspace_id`
- `idx_catalog_items_name`
- `idx_catalog_items_category`
- `idx_catalog_items_type`
- `idx_catalog_items_is_active`

## `budgets`

Campos:

- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references workspaces(id)`
- `client_id uuid not null references clients(id)`
- `project_id uuid references projects(id)`
- `budget_number integer not null`
- `title text not null`
- `description text`
- `issue_date date not null default current_date`
- `valid_until date`
- `execution_deadline text`
- `payment_terms text`
- `included_scope text`
- `excluded_scope text`
- `customer_notes text`
- `internal_notes text`
- `subtotal numeric(14,2) not null default 0`
- `discount_total numeric(14,2) not null default 0`
- `tax_total numeric(14,2) not null default 0`
- `margin_total numeric(14,2) not null default 0`
- `total numeric(14,2) not null default 0`
- `status text not null default 'draft'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- `unique(workspace_id, budget_number)`
- `valid_until is null or valid_until >= issue_date`
- valores monetários `>= 0`
- `status in ('draft', 'sent', 'approved', 'rejected', 'expired', 'cancelled')`

Índices:

- `idx_budgets_workspace_id`
- `idx_budgets_client_id`
- `idx_budgets_project_id`
- `idx_budgets_status`
- `idx_budgets_created_at`
- `idx_budgets_budget_number`

## `budget_items`

Campos:

- `id uuid primary key default gen_random_uuid()`
- `budget_id uuid not null references budgets(id) on delete cascade`
- `catalog_item_id uuid references catalog_items(id)`
- `name text not null`
- `description text`
- `type text`
- `unit text not null default 'unit'`
- `quantity numeric(14,4) not null`
- `cost_unit numeric(14,2) not null default 0`
- `price_unit numeric(14,2) not null default 0`
- `discount numeric(14,2) not null default 0`
- `margin numeric(14,2) not null default 0`
- `subtotal numeric(14,2) not null default 0`
- `sort_order integer not null default 0`
- `notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- `quantity > 0`
- valores monetários `>= 0`
- `discount <= quantity * price_unit`

Índices:

- `idx_budget_items_budget_id`
- `idx_budget_items_catalog_item_id`
- `idx_budget_items_sort_order`

## `budget_status_history`

Campos:

- `id uuid primary key default gen_random_uuid()`
- `budget_id uuid not null references budgets(id) on delete cascade`
- `old_status text`
- `new_status text not null`
- `notes text`
- `created_at timestamptz not null default now()`

Índices:

- `idx_budget_status_history_budget_id`
- `idx_budget_status_history_created_at`

## `settings`

Campos:

- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references workspaces(id)`
- `company_name text not null`
- `company_document text`
- `company_phone text`
- `company_email text`
- `company_address text`
- `default_budget_validity_days integer not null default 15`
- `default_payment_terms text`
- `default_notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- `unique(workspace_id)`
- `default_budget_validity_days > 0`

## `budget_exports` opcional

Campos:

- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references workspaces(id)`
- `budget_id uuid not null references budgets(id) on delete cascade`
- `file_name text`
- `exported_at timestamptz not null default now()`

Uso:

- Registrar geração de PDF quando necessário.

## Segurança e RLS

Supabase recomenda RLS para tabelas expostas ao browser, especialmente no schema `public`. Como o MVP não terá login, policies definitivas por usuário/workspace ficam planejadas para a fase autenticada. Antes de produção pública, cada tabela deve ter RLS habilitado e policies baseadas em membership de workspace.
