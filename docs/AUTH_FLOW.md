# AUTH_FLOW - Supabase Auth

## Estado atual analisado

- O sistema usa Next.js App Router com telas operacionais em `src/app/`.
- O layout raiz aplica `AppShell` para todas as rotas, inclusive futuras telas públicas.
- O client Supabase atual fica em `src/lib/supabase/client.ts` e usa apenas `@supabase/supabase-js`.
- Não há `/login`, `/register`, `/forgot-password`, `auth.service.ts`, `useAuth.ts`, `profiles` ou `workspace_members`.
- Services usam `DEFAULT_WORKSPACE_ID` fixo em `src/lib/constants/workspace.ts`.
- Migrations `0002`, `0003` e `0004` foram criadas para liberar o MVP sem login, mas são temporárias e devem ser substituídas por RLS real.

## Estratégia escolhida

Usar Supabase Auth com email/senha, sessão baseada em cookies via `@supabase/ssr`, rotas protegidas por `proxy.ts`/server client e RLS por membership de workspace.

Referência oficial Supabase SSR Next.js:

- https://supabase.com/docs/guides/auth/server-side/nextjs

## Rotas públicas

- `/login`
- `/register`
- `/forgot-password`

Usuário autenticado acessando `/login` ou `/register` deve ser redirecionado para `/dashboard`.

## Rotas privadas

- `/dashboard`
- `/clients`
- `/projects`
- `/catalog`
- `/budgets`
- `/reports`
- `/settings`
- `/onboarding/workspace`

Usuário não autenticado acessando rota privada deve ser redirecionado para `/login`.

## Organização de rotas planejada

Para separar layout público e layout autenticado:

```txt
src/app/
  (auth)/
    login/
    register/
    forgot-password/
    layout.tsx
  (app)/
    dashboard/
    clients/
    projects/
    catalog/
    budgets/
    reports/
    settings/
    layout.tsx
  onboarding/
    workspace/
```

O `AppShell` deve ficar apenas no layout protegido `(app)`.

## Fluxo de login

1. Usuário acessa `/login`.
2. Informa email e senha.
3. Frontend chama `auth.service.ts` com `supabase.auth.signInWithPassword`.
4. Supabase cria sessão.
5. App busca memberships do usuário.
6. Se existir workspace, seleciona o primeiro workspace ativo e redireciona para `/dashboard`.
7. Se não existir workspace, redireciona para `/onboarding/workspace`.

## Fluxo de cadastro

Escolha: Opção B, criar workspace após primeiro login/sessão autenticada.

Motivo:

- Supabase pode exigir confirmação de email; nesse cenário `signUp` pode não retornar sessão utilizável.
- Criar workspace depois que o usuário está autenticado evita usar `service_role` no frontend.
- A tela de cadastro ainda coleta `workspace_name`, que será enviado como `user_metadata` e usado para preencher o onboarding.

Passos:

1. Usuário acessa `/register`.
2. Informa nome, email, senha, confirmação de senha, empresa/workspace e telefone opcional.
3. Frontend valida com Zod.
4. `auth.service.ts` chama `supabase.auth.signUp` com metadata:
   - `full_name`
   - `phone`
   - `workspace_name`
5. Trigger SQL cria `profiles` automaticamente a partir de `auth.users`.
6. Se Supabase retornar sessão ativa, o app chama `workspace.service.ts` para criar o workspace inicial.
7. Se confirmação de email estiver habilitada, o app mostra mensagem para confirmar email e completar criação após login.
8. Após login sem workspace, `/onboarding/workspace` cria:
   - `workspaces`
   - `workspace_members` com role `owner`
   - `settings`

## Fluxo de logout

1. Usuário clica em sair no topbar/sidebar.
2. Frontend chama `supabase.auth.signOut`.
3. Query cache é limpo.
4. Usuário é redirecionado para `/login`.
5. Rotas privadas deixam de renderizar dados.

## Recuperação de senha

Rota `/forgot-password` deve chamar `supabase.auth.resetPasswordForEmail`.

Para troca efetiva de senha, há duas opções:

- Criar rota `/update-password` para usuários que chegam pelo link de recuperação.
- Adiar tela de nova senha se o escopo ficar grande, mantendo apenas solicitação de email.

Para o MVP autenticado, será implementado o pedido de recuperação e planejada a tela `/update-password` se o redirect do Supabase for configurado.

## Persistência de sessão

- Browser client via `@supabase/ssr` mantém sessão em cookies.
- Server client lê cookies.
- `proxy.ts` atualiza tokens expirados e protege rotas.
- Em código server-side, usar validação de claims/JWT conforme recomendação oficial do Supabase, evitando confiar somente em sessão não revalidada.

## Workspace atual

O frontend não deve usar `NEXT_PUBLIC_DEFAULT_WORKSPACE_ID` como fonte de verdade após Auth.

Nova regra:

1. Buscar memberships do usuário autenticado.
2. Selecionar workspace ativo.
3. Passar `workspaceId` para services/hooks.
4. Services continuam filtrando por `workspace_id` por performance e clareza.
5. RLS garante isolamento mesmo se um filtro for omitido.

## Loading e redirecionamentos

- Enquanto a sessão é carregada, exibir estado de loading industrial simples.
- Usuário sem sessão em rota privada: redirect `/login`.
- Usuário com sessão em rota pública: redirect `/dashboard`.
- Usuário com sessão, mas sem workspace: redirect `/onboarding/workspace`.

## Arquivos planejados

```txt
src/lib/supabase/browser.ts
src/lib/supabase/server.ts
src/lib/supabase/proxy.ts
src/proxy.ts
src/services/auth.service.ts
src/services/profile.service.ts
src/services/workspace.service.ts
src/hooks/useAuth.ts
src/hooks/useWorkspace.ts
src/components/auth/auth-card.tsx
src/components/auth/login-form.tsx
src/components/auth/register-form.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/onboarding/workspace/page.tsx
```

## Critérios de aceite do fluxo

- Login funciona com email/senha.
- Cadastro cria usuário e profile.
- Workspace inicial é criado após sessão autenticada.
- Logout encerra sessão.
- Refresh mantém sessão.
- Rotas privadas bloqueiam usuário deslogado.
- Usuário autenticado não acessa telas de login/cadastro.
- Dados são filtrados pelo workspace atual e protegidos por RLS.
