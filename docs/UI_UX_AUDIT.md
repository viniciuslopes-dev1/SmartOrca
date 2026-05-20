# UI/UX Audit

## Escopo analisado

- `src/components/layout/app-shell.tsx`
- `src/components/layout/page-header.tsx`
- `src/components/ui/*`
- `src/components/feedback/data-state.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/clients/page.tsx`
- `src/app/projects/page.tsx`
- `src/app/catalog/page.tsx`
- `src/app/budgets/page.tsx`
- `src/app/reports/page.tsx`
- `src/app/settings/page.tsx`

## Telas e fluxos principais mapeados

- Autenticacao: `login`, `register`, `forgot-password`
- Shell principal com sidebar e header
- Dashboard com metricas, atalhos e listas recentes
- CRUD de clientes
- CRUD de obras/projetos
- CRUD de catalogo
- CRUD de orcamentos
- Relatorios com cards, graficos e tabela
- Configuracoes gerais

## Problemas visuais encontrados

1. Inconsistencia de botoes de acao primarios e secundarios entre paginas (muitas classes inline repetidas).
2. Inconsistencia de densidade, padding e alinhamento em toolbars de filtros.
3. Tabelas com padrao parcialmente repetido e sem contrato visual centralizado.
4. Header principal com pouco destaque de contexto e sem backdrop mobile ao abrir menu.
5. Estados de loading/erro/vazio com variacao de contraste e pouca hierarquia.
6. Falta de tokenizacao minima para superficies (card, tabela, toolbar) em nivel global.

## Problemas de usabilidade encontrados

1. Em mobile, abrir menu lateral sem backdrop dificulta fechamento intuitivo.
2. Acoes principais em listagens nao seguem sempre o mesmo padrao visual.
3. Leitura de tabelas longas pode ficar cansativa por falta de consistencia de spacing e row states.
4. Mensagens de feedback estao corretas, mas sem padrao visual unificado por contexto.
5. Filtros em listagens tem comportamento bom, mas com composicao visual variavel.

## Componentes a padronizar

- `AppShell`
- `PageHeader`
- `LoadingState`, `ErrorState`, `EmptyState`
- `Card`
- `Button` (uso consistente nas telas)
- Wrappers de tabela/listagem (classe compartilhada de surface, toolbar e table)

## Riscos identificados

- Regressao visual em mobile ao ajustar shell/header/sidebar.
- Regressao de contraste em estados de feedback.
- Regressao de alinhamento em tabelas existentes ao trocar classes.
- Risco baixo de impacto funcional (sem alteracao de regras de negocio).
