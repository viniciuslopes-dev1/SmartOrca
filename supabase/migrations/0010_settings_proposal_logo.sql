alter table public.settings
  add column if not exists proposal_logo_url text,
  add column if not exists proposal_logo_path text;
