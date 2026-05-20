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

## Atualização técnica - Supabase Auth

### Dependência nova planejada

- Adicionar `@supabase/ssr` para clientes browser/server com cookies.

### Supabase clients planejados

```txt
src/lib/supabase/browser.ts
src/lib/supabase/server.ts
src/lib/supabase/proxy.ts
src/proxy.ts
```

O browser client será usado por componentes client-side. O server client/proxy será usado para refresh de sessão e proteção de rotas no App Router.

### Arquitetura de rotas

Separar layouts por route groups:

```txt
src/app/(auth)/layout.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/(app)/layout.tsx
src/app/(app)/dashboard/page.tsx
...
```

O layout protegido `(app)` renderiza `AppShell`. O layout público `(auth)` usa tela centralizada industrial, sem sidebar.

### Services e hooks novos

- `auth.service.ts`: login, cadastro, logout, recuperação de senha.
- `profile.service.ts`: profile do usuário atual.
- `workspace.service.ts`: listar workspaces, workspace atual e criação inicial.
- `useAuth.ts`: sessão, usuário, loading e ações.
- `useWorkspace.ts`: workspace selecionado e membership.

### Ajuste dos services existentes

Remover `DEFAULT_WORKSPACE_ID` como fonte de verdade. Cada service deve receber `workspaceId` validado pelo hook de workspace:

```ts
listClients(workspaceId, search)
createClient(workspaceId, input)
```

As queries continuam filtrando `workspace_id` explicitamente por performance, mas RLS será a proteção real.

### Validações novas

- Login: email obrigatório, email válido, senha obrigatória.
- Cadastro: nome obrigatório, email válido, senha mínima, confirmação igual, workspace obrigatório.
- Workspace onboarding: nome obrigatório.

### Tipagem nova

Atualizar `database.types.ts` para incluir:

- `Profile`
- `WorkspaceMember`
- `WorkspaceRole`
- `WorkspaceWithMembership`

### Estratégia de proteção

Usar proxy/server verification para rotas privadas e guard client-side apenas como complemento visual de loading. Decisão registrada em `ADR.md`.

## Atualização técnica - Orçamento por grupos

### Diagnóstico do fluxo atual

- `src/components/budgets/budget-form.tsx` usa `useFieldArray` com `items`.
- `src/lib/validations/schemas.ts` valida `budgetSchema.items`.
- `src/lib/budget-form-mapper.ts` converte o formulário para `SaveBudgetInput` plano.
- `src/services/budgets.service.ts` carrega `budget_items(*)`, salva o cabeçalho em `budgets` e reinserta todos os itens.
- `src/lib/calculations/budget.ts` calcula subtotal e total a partir de uma lista plana.
- `src/components/budgets/budget-pdf.tsx` e `src/app/budgets/[id]/page.tsx` renderizam itens sem grupos.

### Nova modelagem no frontend

Adicionar tipos de formulário agrupado:

```ts
type BudgetGroupFormValues = {
  id?: string;
  name: string;
  type: "labor" | "material" | "service" | "product" | "stage" | "other";
  sort_order: number;
  notes?: string;
  items: BudgetItemFormValues[];
};
```

`BudgetFormValues` deve trocar `items` por `groups`, mantendo adaptadores de compatibilidade para dados antigos.

### Componentes planejados

- `BudgetForm`: orquestra dados gerais, grupos, totais e submit.
- `BudgetGroupCard`: exibe cabeçalho do grupo, tipo, subtotal, ações e itens.
- `BudgetGroupItemsTable`: edita os itens dentro de um grupo.
- `BudgetTotalsPanel`: mostra subtotal, descontos, taxas, margem e total.
- `BudgetEmptyGroupsState`: orienta criação do primeiro grupo.

### Cálculos

Centralizar em `src/lib/calculations/budget.ts`:

- `calculateItemSubtotal(item)`.
- `calculateGroupSubtotal(group)`.
- `calculateGroupedBudgetTotals(groups, discount_total, tax_total)`.
- `normalizeMoney(value)` para evitar `NaN`, `undefined` e arredondamento inconsistente.

As regras existentes de item e total devem ser preservadas: desconto por item reduz subtotal, desconto total reduz o orçamento e taxas aumentam o total.

### Persistência Supabase

Criar tabela `budget_groups` e relacionar `budget_items.group_id` com ela. O service de orçamento deverá:

1. Criar ou atualizar `budgets`.
2. Criar, atualizar ou recriar grupos do orçamento.
3. Inserir itens vinculados ao grupo correto.
4. Manter transição segura para orçamentos antigos.

No MVP, como o service atual já usa reinserção dos itens em atualização, a primeira implementação pode recriar grupos e itens do orçamento dentro do mesmo fluxo lógico, desde que preserve o orçamento pai e trate erro de forma clara.

### Compatibilidade

- `BudgetWithRelations` deve aceitar `budget_groups` quando existir.
- Se `budget_groups` vier vazio e `budget_items` vier preenchido, o mapper cria um grupo temporário "Itens do orçamento".
- Em novo salvamento, esses itens passam a ser persistidos com `group_id`.

### Visualização e PDF

Visualização e PDF devem renderizar:

- Nome do grupo.
- Tipo do grupo.
- Itens internos.
- Subtotal do grupo.
- Total geral.

Caso o orçamento antigo ainda não tenha grupo persistido, usar o grupo padrão calculado no mapper.

### Segurança e RLS

`budget_groups` não deve ter `workspace_id` próprio para evitar divergência. O acesso será protegido por relacionamento com `budgets.workspace_id`, seguindo a mesma lógica de `budget_items`.

## Atualização técnica - Importação de Excel para catálogo

### Arquivos planejados

- `src/app/catalog/import/page.tsx`: upload, prévia e confirmação.
- `src/lib/catalog-excel-import.ts`: parser client-side da planilha.
- `src/services/catalog.service.ts`: inserção em lote no Supabase.
- `src/hooks/useCatalogItems.ts`: mutation de importação.

### Estratégia

Usar `xlsx` no frontend para ler o arquivo local do usuário sem enviar o arquivo bruto para servidor. O parser normaliza cabeçalhos, detecta a linha de cabeçalho e converte linhas válidas para `catalog_items`.

### Mapeamento flexível

O parser reconhece variações como:

- `descrição`, `serviço`, `produto`, `item`, `insumo` para nome.
- `setor`, `categoria`, `grupo` para categoria.
- `un`, `und`, `unidade` para unidade.
- `valor custo`, `custo unitário` para custo.
- `valor unitário`, `preço`, `preço venda` para preço.
- `coef`, `coeficiente`, `fator` para multiplicador.

### Segurança

O arquivo é processado no navegador. O banco recebe apenas os itens confirmados na prévia, sempre via service com `workspace_id` do usuário autenticado e RLS de `catalog_items`.
