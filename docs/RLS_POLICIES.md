# RLS_POLICIES - Policies por Workspace

## Estado atual analisado

As migrations atuais têm policies temporárias para o MVP sem login:

- `0002_mvp_rls_policies.sql`
- `0004_apply_all_mvp_rls_policies.sql`

Essas policies permitem acesso do papel `anon` ao workspace fixo `00000000-0000-0000-0000-000000000001`. Elas foram úteis para protótipo, mas não são adequadas para SaaS real.

## Diretriz nova

- Remover dependência do workspace fixo.
- Não permitir policies `to anon` em tabelas de negócio.
- Usar `to authenticated`.
- Usar `workspace_members` como fonte de autorização.
- Usar `(select auth.uid())` em policies, conforme recomendação de performance da documentação Supabase.
- Manter filtros explícitos nos services por `workspace_id` para performance.

Referência oficial:

- https://supabase.com/docs/guides/database/postgres/row-level-security

## Tabelas com RLS obrigatória

- `profiles`
- `workspaces`
- `workspace_members`
- `clients`
- `projects`
- `catalog_items`
- `budgets`
- `budget_items`
- `budget_status_history`
- `settings`
- `budget_exports`

## Funções auxiliares planejadas

Criar funções em schema não exposto, por exemplo `private`, para simplificar policies:

```sql
create schema if not exists private;

create function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
    and user_id = (select auth.uid())
  );
$$;

create function private.has_workspace_role(target_workspace_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
    and user_id = (select auth.uid())
    and role = any(allowed_roles)
  );
$$;
```

Observação: funções `security definer` não devem ficar em schema exposto pela API.

## `profiles`

Regras:

- Usuário autenticado vê apenas o próprio profile.
- Usuário autenticado atualiza apenas o próprio profile.
- Inserts devem ocorrer via trigger em `auth.users`.

Policy planejada:

```sql
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));
```

## `workspaces`

Regras:

- Usuário vê workspaces em que é membro.
- Usuário cria workspace com `owner_id = auth.uid()`.
- Owner/admin pode atualizar workspace.

Policy planejada:

```sql
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
```

## `workspace_members`

Regras:

- Usuário vê memberships dos workspaces em que participa.
- Usuário pode ver o próprio membership.
- Owner/admin pode gerenciar membros.
- Criação inicial de owner deve ocorrer via RPC segura ou dentro do fluxo de criação de workspace.

Policy planejada:

```sql
create policy "workspace_members_select_member"
on public.workspace_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.is_workspace_member(workspace_id)
);

create policy "workspace_members_insert_admin"
on public.workspace_members for insert
to authenticated
with check (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "workspace_members_update_admin"
on public.workspace_members for update
to authenticated
using (private.has_workspace_role(workspace_id, array['owner', 'admin']))
with check (private.has_workspace_role(workspace_id, array['owner', 'admin']));
```

Para criar o primeiro owner, usar RPC `create_workspace_for_current_user`.

## Tabelas de negócio com `workspace_id`

Aplica-se a:

- `clients`
- `projects`
- `catalog_items`
- `budgets`
- `settings`
- `budget_exports`

Regras:

- Select apenas para membro do workspace.
- Insert apenas dentro de workspace do qual o usuário é membro.
- Update apenas dentro de workspace do qual o usuário é membro.
- Delete deve ser evitado no frontend para cadastros principais; quando existir, deve exigir membership e preferencialmente owner/admin em ações sensíveis.

Policy base:

```sql
create policy "table_select_workspace_member"
on public.<table> for select
to authenticated
using (private.is_workspace_member(workspace_id));

create policy "table_insert_workspace_member"
on public.<table> for insert
to authenticated
with check (private.is_workspace_member(workspace_id));

create policy "table_update_workspace_member"
on public.<table> for update
to authenticated
using (private.is_workspace_member(workspace_id))
with check (private.is_workspace_member(workspace_id));
```

## `budget_items`

`budget_items` não tem `workspace_id`. O acesso depende do orçamento pai.

```sql
create policy "budget_items_select_workspace_member"
on public.budget_items for select
to authenticated
using (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_items.budget_id
    and private.is_workspace_member(b.workspace_id)
  )
);

create policy "budget_items_insert_workspace_member"
on public.budget_items for insert
to authenticated
with check (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_items.budget_id
    and private.is_workspace_member(b.workspace_id)
  )
);
```

Update/delete seguem a mesma regra.

## `budget_groups`

`budget_groups` também não terá `workspace_id`. O acesso depende do orçamento pai.

```sql
create policy "budget_groups_select_workspace_member"
on public.budget_groups for select
to authenticated
using (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_groups.budget_id
    and private.is_workspace_member(b.workspace_id)
  )
);

create policy "budget_groups_insert_workspace_member"
on public.budget_groups for insert
to authenticated
with check (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_groups.budget_id
    and private.is_workspace_member(b.workspace_id)
  )
);
```

Update/delete seguem a mesma regra.

Regra adicional planejada para `budget_items`:

- Quando `budget_items.group_id` for informado, o grupo deve pertencer ao mesmo `budget_id` do item.
- Essa validação pode ser feita por trigger ou função SQL antes de produção pública.

## `budget_status_history`

Também depende do orçamento pai:

```sql
create policy "budget_status_history_select_workspace_member"
on public.budget_status_history for select
to authenticated
using (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_status_history.budget_id
    and private.is_workspace_member(b.workspace_id)
  )
);
```

Insert segue a mesma regra.

## Constraints adicionais planejadas

Para evitar relacionamento cruzado entre workspaces:

- `projects(workspace_id, id)` unique auxiliar.
- `clients(workspace_id, id)` unique auxiliar.
- `budgets(workspace_id, id)` unique auxiliar.
- FKs compostas quando necessário.
- Trigger ou constraint para garantir que `projects.client_id` pertence ao mesmo workspace.
- Trigger ou constraint para garantir que `budgets.client_id` e `budgets.project_id` pertencem ao mesmo workspace.

## Policies antigas

Durante a implementação:

- Criar migration nova para dropar policies `mvp_*`.
- Revogar grants amplos de `anon` nas tabelas de negócio se necessário.
- Manter apenas policies `to authenticated`.
- Não apagar dados úteis.

## Testes RLS obrigatórios

- Usuário A cria cliente.
- Usuário B não lista cliente do usuário A.
- Usuário B não acessa detalhe por ID direto.
- Usuário B não cria orçamento no workspace A.
- Usuário A acessa `budget_items` apenas via orçamento do próprio workspace.
- Usuário sem login não acessa nenhuma tabela de negócio.
