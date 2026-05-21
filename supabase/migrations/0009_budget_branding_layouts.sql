alter table public.settings
  add column if not exists logo_url text,
  add column if not exists logo_path text,
  add column if not exists default_budget_layout text not null default 'classic';

alter table public.settings
  drop constraint if exists settings_default_budget_layout_check;

alter table public.settings
  add constraint settings_default_budget_layout_check check (
    default_budget_layout in ('classic', 'modern', 'compact', 'detailed', 'corporate', 'premium', 'technical', 'minimal')
  );

alter table public.budgets
  add column if not exists budget_layout text;

alter table public.budgets
  drop constraint if exists budgets_budget_layout_check;

alter table public.budgets
  add constraint budgets_budget_layout_check check (
    budget_layout is null
    or budget_layout in ('classic', 'modern', 'compact', 'detailed', 'corporate', 'premium', 'technical', 'minimal')
  );

update public.budgets b
set budget_layout = s.default_budget_layout
from public.settings s
where b.workspace_id = s.workspace_id
  and b.budget_layout is null;

create index if not exists idx_budgets_budget_layout on public.budgets(workspace_id, budget_layout);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workspace-branding',
  'workspace-branding',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "workspace_branding_read_public" on storage.objects;
drop policy if exists "workspace_branding_insert_member" on storage.objects;
drop policy if exists "workspace_branding_update_member" on storage.objects;
drop policy if exists "workspace_branding_delete_member" on storage.objects;

create policy "workspace_branding_read_public"
on storage.objects
for select
to public
using (bucket_id = 'workspace-branding');

create policy "workspace_branding_insert_member"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'workspace-branding'
  and private.is_workspace_member((storage.foldername(name))[1]::uuid)
);

create policy "workspace_branding_update_member"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'workspace-branding'
  and private.is_workspace_member((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'workspace-branding'
  and private.is_workspace_member((storage.foldername(name))[1]::uuid)
);

create policy "workspace_branding_delete_member"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'workspace-branding'
  and private.is_workspace_member((storage.foldername(name))[1]::uuid)
);

