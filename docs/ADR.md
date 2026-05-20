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

## ADR-009 - Supabase Auth com SSR no Next.js

Status: proposto.

Decisão: usar Supabase Auth com `@supabase/ssr`, browser/server clients e proxy de sessão.

Motivo: a documentação atual do Supabase para Next.js recomenda clientes configurados com cookies e um proxy para atualizar tokens e disponibilizar sessão para server/client components. Isso é mais seguro e consistente que proteger rotas apenas com guard client-side.

Consequências: será necessário reorganizar rotas em layouts públicos e protegidos, criar `src/proxy.ts` e ajustar o client Supabase existente.

Referência: https://supabase.com/docs/guides/auth/server-side/nextjs

## ADR-010 - Workspace criado após sessão autenticada

Status: proposto.

Decisão: cadastro coleta nome da empresa, mas o workspace inicial será criado após sessão autenticada, com onboarding/fallback.

Motivo: Supabase pode exigir confirmação de email e não retornar sessão imediata após `signUp`. Criar workspace depois do login evita usar `service_role` no frontend e mantém RLS funcionando com `auth.uid()`.

Consequências: `/register` deve salvar `workspace_name` em metadata. Após login, se não houver membership, o usuário é enviado para `/onboarding/workspace`.

## ADR-011 - RLS por membership de workspace

Status: proposto.

Decisão: substituir policies temporárias `mvp_*` por policies `to authenticated` baseadas em `workspace_members`.

Motivo: o MVP atual permite acesso anon ao workspace fixo e não isola usuários reais. SaaS multiworkspace exige que cada operação seja autorizada pelo vínculo do usuário ao workspace.

Consequências: todos os services precisam usar workspace atual, e o banco precisa proteger também tabelas filhas como `budget_items` e `budget_status_history`.

Referência: https://supabase.com/docs/guides/database/postgres/row-level-security

## ADR-012 - Orçamentos com grupos/seções

Status: proposto.

Decisão: adicionar uma entidade `budget_groups` entre `budgets` e `budget_items`, em vez de simular grupos apenas com `category`, `type` ou linhas especiais dentro de `budget_items`.

Motivo: a planilha analisada mostra que o orçamento real é organizado por blocos operacionais, como mão de obra, materiais, serviços, setores ou etapas. Usar uma tabela própria permite subtotal por grupo, ordenação, observações e evolução futura sem transformar a tela em réplica de Excel.

Consequências:

- `budget_items` passará a ter `group_id` opcional durante a transição.
- Orçamentos antigos sem grupo serão exibidos em um grupo padrão de compatibilidade.
- Services e tipos precisam carregar `budget_groups` junto dos itens.
- PDF e visualização precisam renderizar grupos e subtotais.
- RLS de `budget_groups` será baseada no orçamento pai e workspace.

Alternativas rejeitadas:

- Copiar a planilha visualmente: rejeitado porque manteria limitações do Excel e pioraria a experiência web.
- Usar apenas `catalog_items.category`: rejeitado porque categoria do catálogo não representa necessariamente etapa, composição ou grupo de venda do orçamento.
- Guardar grupos em JSON dentro de `budgets`: rejeitado porque dificultaria consultas, RLS, relatórios e manutenção.

## ADR-013 - Fórmula de preço da planilha como evolução futura

Status: proposto.

Decisão: neste incremento, manter a regra atual do sistema para subtotal (`quantidade * valor_unitário - desconto`) e estruturar os grupos. A fórmula da planilha com indiretos e lucro por dentro deve ser tratada como evolução separada.

Motivo: o pedido atual prioriza transformar a lógica organizacional da planilha em fluxo nativo. Alterar simultaneamente a precificação poderia quebrar orçamentos existentes, PDF, relatórios e expectativas já implementadas.

Consequências:

- O sistema ganha separação por mão de obra, materiais e serviços agora.
- Campos como percentual de indiretos, lucro e composição de preço podem ser planejados depois com testes específicos.
- A análise da planilha fica registrada para orientar essa evolução.
