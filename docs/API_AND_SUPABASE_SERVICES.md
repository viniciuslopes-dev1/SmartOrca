# API and Supabase Services

## Princípio

Componentes de UI não chamam Supabase diretamente. O acesso ao banco fica centralizado em services, consumido por hooks com TanStack Query.

## Supabase client

Arquivo previsto:

```txt
src/lib/supabase/client.ts
```

Responsabilidades:

- Ler `NEXT_PUBLIC_SUPABASE_URL`.
- Ler chave pública apropriada.
- Criar client tipado com `Database`.
- Nunca usar `service_role`.

## Workspace temporário

Arquivo previsto:

```txt
src/lib/constants/workspace.ts
```

Responsabilidades:

- Centralizar `DEFAULT_WORKSPACE_ID`.
- Facilitar remoção futura quando houver Auth.

## Padrão de resposta

Services devem retornar dados ou lançar erro normalizado.

Formato lógico de erro:

```ts
type ServiceError = {
  message: string;
  code?: string;
  details?: unknown;
};
```

Mensagens técnicas não devem ser exibidas diretamente ao usuário final.

## `clients.service.ts`

Operações:

- `listClients(params)`: busca por nome, documento, telefone ou email.
- `getClientById(id)`.
- `createClient(input)`.
- `updateClient(id, input)`.
- `deactivateClient(id)`.
- `getClientRelations(id)`: obras e orçamentos relacionados.

Tabelas:

- `clients`
- `projects`
- `budgets`

## `projects.service.ts`

Operações:

- `listProjects(params)`: filtro por cliente, status e texto.
- `getProjectById(id)`.
- `createProject(input)`.
- `updateProject(id, input)`.
- `getProjectBudgets(projectId)`.

Tabelas:

- `projects`
- `clients`
- `budgets`

## `catalog.service.ts`

Operações:

- `listCatalogItems(params)`.
- `listActiveCatalogItems(params)`.
- `getCatalogItemById(id)`.
- `createCatalogItem(input)`.
- `updateCatalogItem(id, input)`.
- `deactivateCatalogItem(id)`.

Tabelas:

- `catalog_items`

## `budgets.service.ts`

Operações:

- `listBudgets(params)`.
- `getBudgetById(id)`: cabeçalho, cliente, projeto e itens.
- `createBudget(input)`.
- `updateBudget(id, input)`.
- `saveBudgetItems(budgetId, items)`.
- `duplicateBudget(id)`.
- `changeBudgetStatus(id, status, notes?)`.
- `getBudgetStatusHistory(id)`.

Tabelas:

- `budgets`
- `budget_items`
- `budget_status_history`
- `clients`
- `projects`
- `catalog_items`

Observação:

- Salvar orçamento deve manter cabeçalho e itens consistentes. Se não houver RPC/transação no MVP, a service deve tratar rollback lógico ou sequência segura. Uma RPC SQL pode ser adicionada se a consistência exigir transação real.

## `reports.service.ts`

Operações:

- `getDashboardMetrics()`.
- `getRecentBudgets()`.
- `getRecentProjects()`.
- `getBudgetTotalsByPeriod(params)`.
- `getBudgetsByStatus(params)`.
- `getTopClients(params)`.
- `getMostUsedItems(params)`.
- `getAverageTicket(params)`.

Tabelas:

- `clients`
- `projects`
- `budgets`
- `budget_items`

## `settings.service.ts`

Operações:

- `getSettings()`.
- `updateSettings(input)`.

Tabelas:

- `settings`

## Tabelas acessadas diretamente

No MVP, services usarão tabelas diretamente via Supabase JS Client. Edge Functions não são previstas inicialmente.

Uso direto:

- CRUD simples.
- Listas paginadas.
- Joins suportados pelo Supabase.
- Agregações simples para dashboard.

## SQL Functions ou RPC

Podem ser usadas para:

- Gerar próximo `budget_number` por workspace.
- Salvar orçamento e itens em transação.
- Consultas agregadas complexas do dashboard.

Critério:

- Criar RPC somente quando reduzir risco de inconsistência ou melhorar performance de forma clara.

## Edge Functions

Fora do escopo do MVP. Considerar futuramente para:

- Geração server-side de PDF.
- Envio de emails.
- Integrações externas.
- Processos com secrets.

## Geração de tipos TypeScript

Depois que o schema existir, gerar tipos com Supabase CLI e salvar em:

```txt
src/types/database.types.ts
```

Comando previsto:

```bash
supabase gen types typescript --project-id "$PROJECT_REF" --schema public > src/types/database.types.ts
```

Para ambiente local:

```bash
supabase gen types typescript --local --schema public > src/types/database.types.ts
```

Referência: https://supabase.com/docs/guides/api/rest/generating-types

## Tratamento de erros

- Erros Supabase devem ser normalizados.
- UI deve exibir mensagem amigável.
- Erros de validação ficam no formulário.
- Erros inesperados podem aparecer como alerta operacional genérico.
- Não mostrar stack trace ao usuário.
