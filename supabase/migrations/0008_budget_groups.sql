create table if not exists public.budget_groups (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  name text not null,
  type text not null default 'service',
  sort_order integer not null default 0,
  subtotal numeric(14,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_groups_name_check check (length(trim(name)) >= 1),
  constraint budget_groups_type_check check (type in ('labor', 'material', 'service', 'product', 'stage', 'other')),
  constraint budget_groups_sort_order_check check (sort_order >= 0),
  constraint budget_groups_subtotal_check check (subtotal >= 0)
);

alter table public.budget_items
add column if not exists group_id uuid references public.budget_groups(id) on delete cascade;

create index if not exists idx_budget_groups_budget_id on public.budget_groups(budget_id);
create index if not exists idx_budget_groups_sort_order on public.budget_groups(budget_id, sort_order);
create index if not exists idx_budget_items_group_id on public.budget_items(group_id);

drop trigger if exists set_budget_groups_updated_at on public.budget_groups;
create trigger set_budget_groups_updated_at
before update on public.budget_groups
for each row execute function public.set_updated_at();

create or replace function public.ensure_budget_item_group_matches_budget()
returns trigger
language plpgsql
as '
begin
  if new.group_id is not null and not exists (
    select 1
    from public.budget_groups bg
    where bg.id = new.group_id
      and bg.budget_id = new.budget_id
  ) then
    raise exception ''budget item group must belong to the same budget'';
  end if;

  return new;
end;
';

drop trigger if exists ensure_budget_item_group_matches_budget on public.budget_items;
create trigger ensure_budget_item_group_matches_budget
before insert or update on public.budget_items
for each row execute function public.ensure_budget_item_group_matches_budget();

grant select, insert, update, delete on public.budget_groups to authenticated;
revoke all on public.budget_groups from anon;

alter table public.budget_groups enable row level security;

drop policy if exists "budget_groups_select_member" on public.budget_groups;
drop policy if exists "budget_groups_insert_member" on public.budget_groups;
drop policy if exists "budget_groups_update_member" on public.budget_groups;
drop policy if exists "budget_groups_delete_member" on public.budget_groups;

create policy "budget_groups_select_member" on public.budget_groups
for select to authenticated
using (
  exists (
    select 1 from public.budgets b
    where b.id = budget_groups.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
);

create policy "budget_groups_insert_member" on public.budget_groups
for insert to authenticated
with check (
  exists (
    select 1 from public.budgets b
    where b.id = budget_groups.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
);

create policy "budget_groups_update_member" on public.budget_groups
for update to authenticated
using (
  exists (
    select 1 from public.budgets b
    where b.id = budget_groups.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
)
with check (
  exists (
    select 1 from public.budgets b
    where b.id = budget_groups.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
);

create policy "budget_groups_delete_member" on public.budget_groups
for delete to authenticated
using (
  exists (
    select 1 from public.budgets b
    where b.id = budget_groups.budget_id
      and private.is_workspace_member(b.workspace_id)
  )
);
