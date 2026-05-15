# TDD - Technical Design Document

## Stack escolhida

- Next.js com App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui como base de componentes.
- Supabase JS Client.
- React Hook Form.
- Zod.
- TanStack Query.
- `@react-pdf/renderer` para geração local de PDF.
- Recharts para gráficos simples.

## Arquitetura frontend

O frontend será organizado por rotas de trabalho, componentes reutilizáveis, services de dados e hooks de consulta/mutação. Componentes de página não devem chamar Supabase diretamente; eles consomem hooks e componentes de formulário/tabela.

Rotas principais:

- `/dashboard`
- `/clients`
- `/clients/[id]`
- `/projects`
- `/projects/[id]`
- `/catalog`
- `/budgets`
- `/budgets/new`
- `/budgets/[id]`
- `/budgets/[id]/edit`
- `/reports`
- `/settings`

## Arquitetura backend/Supabase

O backend do MVP será composto por:

- Supabase Postgres.
- Migrations SQL em `supabase/migrations/`.
- Seed inicial em `supabase/seed.sql`.
- Supabase client no frontend com chave pública/publishable ou anon.
- Tabelas com `workspace_id` para preparação SaaS.
- RLS documentado e preparado para fase com autenticação.
- SQL Functions apenas se necessárias para agregações ou sequência de número de orçamento.
- Edge Functions fora do escopo inicial, salvo necessidade técnica posterior.

## Estrutura de pastas

```txt
src/
  app/
    dashboard/
    clients/
    projects/
    catalog/
    budgets/
    reports/
    settings/
  components/
    layout/
    ui/
    forms/
    tables/
    feedback/
    budgets/
    clients/
    projects/
    catalog/
    reports/
  hooks/
    useClients.ts
    useProjects.ts
    useCatalogItems.ts
    useBudgets.ts
    useReports.ts
  lib/
    supabase/
    validations/
    formatters/
    calculations/
    pdf/
    constants/
  services/
    clients.service.ts
    projects.service.ts
    catalog.service.ts
    budgets.service.ts
    reports.service.ts
    settings.service.ts
  types/
    database.types.ts
    client.types.ts
    project.types.ts
    catalog.types.ts
    budget.types.ts
```

## Componentes principais

- `AppShell`: estrutura com sidebar, topbar e área de conteúdo.
- `SidebarNav`: navegação operacional.
- `PageHeader`: título, breadcrumbs e ações.
- `DataTable`: tabela base com busca, filtros, estados e paginação.
- `EmptyState`, `ErrorState`, `LoadingState`.
- `StatusBadge`: status de cliente, projeto e orçamento.
- `ClientForm`, `ProjectForm`, `CatalogItemForm`.
- `BudgetForm`, `BudgetItemsTable`, `BudgetTotalsPanel`.
- `BudgetPdfDocument`.
- `MetricCard`, `RecentBudgetsTable`, `ReportsCharts`.

## Services

Services encapsulam acesso ao Supabase:

- `clients.service.ts`: listagem, detalhe, criação, edição, inativação.
- `projects.service.ts`: listagem, filtros, detalhe, criação, edição.
- `catalog.service.ts`: CRUD lógico de itens reutilizáveis.
- `budgets.service.ts`: cabeçalho, itens, duplicação, status e totais.
- `reports.service.ts`: agregações para dashboard e relatórios.
- `settings.service.ts`: dados padrão da empresa/prestador.

## Hooks

Hooks combinam TanStack Query, services e mensagens de erro:

- `useClients`, `useClient`, `useCreateClient`, `useUpdateClient`.
- `useProjects`, `useProject`.
- `useCatalogItems`, `useActiveCatalogItems`.
- `useBudgets`, `useBudget`, `useSaveBudget`, `useChangeBudgetStatus`.
- `useDashboardMetrics`, `useReports`.

## Tipos/interfaces

- `Database` gerado via Supabase CLI.
- Tipos derivados: `Client`, `Project`, `CatalogItem`, `Budget`, `BudgetItem`.
- Tipos de formulário separados dos tipos de banco.
- Enums TypeScript espelhando enums/check constraints SQL.

## Validações

Zod deve validar:

- Cliente sem nome.
- Email inválido.
- Documento opcional.
- Projeto sem cliente.
- Orçamento sem cliente.
- Orçamento sem itens.
- Quantidade menor ou igual a zero.
- Preço ou custo negativo.
- Datas inválidas.
- Validade menor que emissão.
- Status fora da lista permitida.

## Geração de PDF

O MVP usará `@react-pdf/renderer` no frontend. O documento será gerado a partir do orçamento salvo, com dados da empresa, cliente, obra, itens, totais, condições, escopos e campo de aceite. Exportações podem ser registradas em `budget_exports` se necessário.

## Estratégia de estado

- TanStack Query para dados remotos.
- Estado local React para edição temporária de formulário.
- React Hook Form para controle de formulário.
- Cálculos derivados por helpers puros.
- Invalidação de queries após mutações.

## Tratamento de erro

- Services retornam erros normalizados.
- Componentes exibem mensagens amigáveis.
- Logs técnicos ficam restritos ao ambiente de desenvolvimento.
- Erros do Supabase não devem expor stack trace ao usuário.
- Formularios devem destacar campos inválidos.

## Performance

- Paginação em listas.
- Busca com debounce.
- Índices por `workspace_id`, FKs, `status`, `created_at` e `budget_number`.
- Queries específicas para dashboard.
- Evitar carregar itens completos quando resumo basta.
- Componentes de orçamento divididos para reduzir renderizações.

## Segurança

- Nunca usar `service_role` no frontend.
- Usar variáveis `NEXT_PUBLIC_SUPABASE_URL` e chave pública apropriada.
- Não commitar secrets.
- Validar inputs no frontend e reforçar constraints no banco.
- Preparar políticas RLS por `workspace_id` para fase com Auth.
- Documentar limitação do MVP sem login.
