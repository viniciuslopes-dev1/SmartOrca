# Budget Groups Migration

## Objetivo

Planejar a alteração de banco necessária para o novo fluxo de orçamento por grupos, sem apagar orçamentos existentes e sem quebrar a estrutura atual de Auth/RLS.

## Estado atual

- `budgets` guarda o cabeçalho e totais.
- `budget_items` guarda todos os itens em lista plana.
- Não existe subtotal por grupo.
- Orçamentos antigos não têm `group_id`.

## Alteração planejada

Criar a tabela `budget_groups`:

```sql
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
```

Adicionar em `budget_items`:

```sql
alter table public.budget_items
add column if not exists group_id uuid references public.budget_groups(id) on delete cascade;
```

## Índices

```sql
create index if not exists idx_budget_groups_budget_id on public.budget_groups(budget_id);
create index if not exists idx_budget_groups_sort_order on public.budget_groups(budget_id, sort_order);
create index if not exists idx_budget_items_group_id on public.budget_items(group_id);
```

## RLS

Ativar RLS em `budget_groups` e aplicar policies por orçamento pai:

- select se o usuário for membro do workspace do orçamento.
- insert se o usuário for membro do workspace do orçamento.
- update se o usuário for membro do workspace do orçamento.
- delete se o usuário for membro do workspace do orçamento.

## Compatibilidade

- `group_id` deve ser nullable no primeiro momento.
- Itens antigos sem grupo continuam válidos.
- A aplicação cria um grupo padrão em memória para leitura de orçamento antigo.
- Ao salvar novamente, o service pode criar um grupo real e vincular os itens.

## Validações futuras

Adicionar trigger para impedir que `budget_items.group_id` aponte para grupo de outro orçamento:

- `budget_items.budget_id` deve ser igual a `budget_groups.budget_id`.
- Se a validação falhar, bloquear insert/update.

Essa trigger pode entrar junto da migration se a implementação precisar de garantia forte desde o primeiro deploy.
