# ADR - Architecture Decision Records

## ADR-001 - Next.js com App Router

Status: aceito.

Decisão: usar Next.js com App Router, TypeScript e Tailwind CSS.

Motivo: a stack entrega estrutura moderna, rotas organizadas, boa DX, build confiável e base adequada para evolução do SaaS.

Consequências: o projeto deve separar rotas, componentes, hooks e services para evitar páginas grandes e lógica de negócio em JSX.

## ADR-002 - Supabase como backend principal

Status: aceito.

Decisão: usar Supabase Postgres, Supabase JS Client e migrations SQL.

Motivo: o produto precisa persistir dados, consultar relacionamentos e evoluir para SaaS multiusuário. Supabase oferece Postgres, APIs automáticas, Auth futura e bom fluxo com TypeScript.

Consequências: todas as entidades persistentes devem ser modeladas no banco. Não usar localStorage como banco principal.

## ADR-003 - MVP sem login

Status: aceito com restrição.

Decisão: não criar tela de login no MVP.

Motivo: o escopo inicial prioriza funcionalidade operacional de orçamento.

Consequências: o MVP não deve ser tratado como pronto para produção pública. A arquitetura terá `workspace_id` e workspace padrão temporário. A versão SaaS real deverá ativar Supabase Auth, associação usuário-workspace e políticas RLS por workspace.

## ADR-004 - RLS planejado para fase autenticada

Status: aceito.

Decisão: documentar RLS e preparar tabelas para isolamento futuro, mas tratar o MVP sem login como ambiente controlado.

Motivo: a documentação oficial do Supabase recomenda RLS para tabelas expostas em schemas como `public`, e informa que RLS deve estar habilitado em tabelas acessadas pelo browser. Sem usuário autenticado, políticas por `auth.uid()` não conseguem isolar dados por usuário.

Estratégia temporária:

- Não expor `service_role`.
- Usar somente chave pública apropriada no frontend.
- Usar workspace padrão.
- Não publicar o MVP sem revisão de segurança.

Estratégia futura:

- Criar tabelas de membros de workspace.
- Vincular `auth.users` a workspaces.
- Habilitar RLS por `workspace_id`.
- Criar policies para `select`, `insert`, `update` e ações permitidas.

Referência: https://supabase.com/docs/guides/database/postgres/row-level-security

## ADR-005 - Geração de PDF no frontend

Status: aceito para MVP.

Decisão: usar `@react-pdf/renderer`.

Motivo: permite gerar PDF a partir de componentes React, reduz infraestrutura inicial e atende o MVP.

Consequências: PDFs muito grandes podem exigir otimização ou geração server-side futura. O template deve receber dados normalizados e totais já calculados.

## ADR-006 - Interface industrial e operacional

Status: aceito.

Decisão: criar UI de sistema de gestão, sem landing page, hero promocional ou estética de venda.

Motivo: o usuário precisa de produtividade, densidade, clareza e controle.

Consequências: usar sidebar, tabelas, filtros, formulários objetivos, badges de status, cards de indicadores e cores sóbrias.

## ADR-007 - Tipos TypeScript gerados do Supabase

Status: aceito.

Decisão: gerar `src/types/database.types.ts` a partir do schema do Supabase quando o schema existir.

Motivo: a documentação oficial do Supabase suporta geração de tipos TypeScript a partir do banco, reduzindo divergência entre Postgres e aplicação.

Referência: https://supabase.com/docs/guides/api/rest/generating-types

## ADR-008 - Migrations versionadas

Status: aceito.

Decisão: versionar schema em `supabase/migrations/`.

Motivo: migrations tornam mudanças auditáveis e reproduzíveis entre ambiente local e remoto.

Referência: https://supabase.com/docs/guides/deployment/database-migrations
