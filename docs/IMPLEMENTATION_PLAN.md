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
