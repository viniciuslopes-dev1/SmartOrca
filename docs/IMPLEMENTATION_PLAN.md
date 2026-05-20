# Implementation Plan

## 1. Setup do projeto

- Criar projeto Next.js com App Router e TypeScript.
- Configurar Tailwind CSS.
- Instalar dependências: Supabase, TanStack Query, React Hook Form, Zod, PDF e gráficos.
- Criar `.env.example`.
- Configurar lint/build.

## 2. Configuração visual/base

- Configurar tokens visuais industriais.
- Criar `AppShell` com sidebar fixa no desktop e navegação mobile.
- Criar topbar compacto.
- Criar componentes de feedback: loading, erro, vazio e confirmação.
- Criar componentes base de tabela, badge, formulário e cards de indicadores.

## 3. Configuração Supabase

- Criar `src/lib/supabase/client.ts`.
- Criar constantes de workspace temporário.
- Criar padrão de erro para services.
- Documentar variáveis de ambiente.

## 4. Criação do schema/migrations

- Criar `supabase/migrations/0001_initial_schema.sql`.
- Criar tabelas, enums/check constraints, FKs e índices.
- Criar trigger de `updated_at`.
- Criar função ou estratégia para número sequencial de orçamento.
- Criar `supabase/seed.sql` com workspace padrão e configurações iniciais.

## 5. Implementação dos módulos principais

- Criar rotas.
- Criar services e hooks.
- Criar tipos manuais iniciais ou gerados.
- Conectar TanStack Query no layout raiz.
- Garantir estados de carregamento, erro, vazio e sucesso.

## 6. Dashboard

- Criar queries de métricas.
- Exibir cards de totais.
- Exibir últimos orçamentos e obras recentes.
- Criar atalhos rápidos.
- Tratar dashboard sem dados.

## 7. Clientes

- Criar listagem com busca.
- Criar formulário de cadastro/edição.
- Criar página de detalhes.
- Exibir obras e orçamentos relacionados.
- Implementar inativação com confirmação.

## 8. Obras/projetos

- Criar listagem com filtros por cliente e status.
- Criar formulário de cadastro/edição.
- Criar página de detalhes.
- Exibir orçamentos vinculados.
- Criar ação para novo orçamento a partir da obra.

## 9. Produtos/serviços

- Criar listagem com busca e filtro por tipo/categoria.
- Criar formulário de cadastro/edição.
- Implementar inativação.
- Preparar seleção rápida dentro do orçamento.

## 10. Orçamentos

- Criar listagem com busca e filtro por status.
- Criar formulário principal.
- Criar tabela de itens editável.
- Permitir item de catálogo e item manual.
- Implementar cálculo centralizado.
- Salvar orçamento e itens em transação lógica.
- Implementar status e histórico.
- Implementar duplicação.
- Criar visualização detalhada.

## 11. Geração/visualização de PDF

- Criar template PDF.
- Gerar a partir de dados salvos.
- Incluir dados da empresa, cliente, obra, itens, totais, condições e escopos.
- Testar layout com orçamento curto e longo.

## 12. Relatórios básicos

- Criar tela de indicadores.
- Total orçado/aprovado por período.
- Taxa de aprovação.
- Orçamentos por status.
- Clientes com mais orçamentos.
- Itens mais usados.
- Ticket médio.

## 13. Testes manuais

- Executar fluxo completo do checklist.
- Testar estados vazios.
- Testar validações.
- Testar responsividade.
- Testar persistência no Supabase.
- Testar build.

## 14. Ajustes finais

- Corrigir erros de console.
- Revisar tipagem.
- Revisar textos operacionais.
- Revisar acessibilidade básica.
- Revisar documentação se houver mudanças relevantes.

## 15. Autenticação Supabase Auth

- Instalar `@supabase/ssr`.
- Criar clients Supabase browser/server.
- Criar proxy de sessão.
- Criar route groups `(auth)` e `(app)`.
- Mover rotas operacionais para layout protegido.
- Criar telas `/login`, `/register` e `/forgot-password`.
- Criar services/hooks de autenticação.
- Criar logout no `AppShell`.

## 16. Modelagem SaaS

- Criar migration para `profiles`.
- Adicionar `owner_id` em `workspaces`.
- Criar `workspace_members`.
- Criar trigger `handle_new_user` para profile.
- Criar RPC segura para workspace inicial.
- Atualizar índices e constraints.
- Remover ou substituir policies temporárias `mvp_*`.

## 17. RLS real por workspace

- Ativar RLS em todas as tabelas obrigatórias.
- Criar policies `to authenticated`.
- Criar funções auxiliares em schema não exposto.
- Proteger tabelas filhas por relacionamento com orçamento/workspace.
- Testar isolamento com dois usuários.

## 18. Ajuste dos módulos existentes para workspace atual

- Atualizar services para receber `workspaceId`.
- Atualizar hooks para usar `useWorkspace`.
- Ajustar dashboard e relatórios.
- Remover dependência de `NEXT_PUBLIC_DEFAULT_WORKSPACE_ID`.
- Garantir estados de loading quando workspace ainda está carregando.

## 19. Novo fluxo de orçamento por grupos

### 19.1 Preparação técnica

- Confirmar a migration de Auth/RLS em ambiente limpo antes de adicionar nova migration.
- Criar migration segura para `budget_groups` e `budget_items.group_id`.
- Atualizar `database.types.ts`.
- Atualizar documentação de RLS para incluir `budget_groups`.

### 19.2 Cálculos e validações

- Criar helpers de subtotal por grupo em `src/lib/calculations/budget.ts`.
- Atualizar Zod para validar `groups[]` e `groups[].items[]`.
- Garantir que orçamento sem grupos ou sem itens mostre erro amigável.
- Garantir que valores inválidos não gerem `NaN`.

### 19.3 Services e mappers

- Atualizar `SaveBudgetInput` para receber grupos.
- Atualizar `getBudgetById` para carregar `budget_groups` com itens.
- Criar mapper de compatibilidade para orçamentos antigos com itens sem grupo.
- Atualizar criação, edição e duplicação de orçamento para persistir grupos.

### 19.4 Interface

- Refatorar `BudgetForm` em componentes menores.
- Adicionar criação, edição e remoção de grupos.
- Adicionar itens dentro do grupo.
- Exibir subtotal por grupo e total geral.
- Manter seleção de item do catálogo.
- Ajustar visualização de orçamento.
- Ajustar PDF para renderizar grupos.

### 19.5 Testes e regressão

- Testar orçamento novo com mão de obra.
- Testar orçamento com mão de obra, materiais e serviços.
- Testar edição de quantidades, valores, descontos, grupos e itens.
- Testar orçamento antigo sem grupos.
- Testar PDF e visualização.
- Rodar typecheck, lint e build.

## 20. Importação de Excel para catálogo

- Adicionar dependência de leitura de planilha.
- Criar parser flexível de cabeçalhos.
- Criar tela `/catalog/import`.
- Criar prévia de itens detectados.
- Criar mutation de importação em lote.
- Adicionar botão "Importar Excel" no catálogo.
- Testar com a planilha do cliente e com cabeçalhos alternativos.
