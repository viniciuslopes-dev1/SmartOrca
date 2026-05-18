# Security Checklist

## Entradas e validação

- [ ] Validar todos os formulários com Zod.
- [ ] Validar cliente sem nome.
- [ ] Validar email inválido.
- [ ] Validar obra sem cliente.
- [ ] Validar orçamento sem cliente.
- [ ] Validar orçamento sem itens.
- [ ] Validar quantidade maior que zero.
- [ ] Validar valores monetários negativos.
- [ ] Validar datas inválidas.
- [ ] Validar validade anterior à emissão.
- [ ] Validar status contra listas permitidas.

## Supabase e secrets

- [ ] Nunca usar `service_role` no frontend.
- [ ] Não salvar secrets em arquivos versionados.
- [ ] Criar `.env.example` sem valores reais.
- [ ] Usar apenas variáveis `NEXT_PUBLIC_` para dados públicos.
- [ ] Revisar permissões do projeto Supabase antes de produção.
- [ ] Confirmar que logs não expõem chaves ou tokens.

## RLS e isolamento

- [ ] Documentar limitação do MVP sem login.
- [ ] Preparar `workspace_id` em todas as tabelas de negócio.
- [ ] Criar workspace padrão apenas para MVP.
- [ ] Aplicar policies temporárias do MVP em `0004_apply_all_mvp_rls_policies.sql` apenas em ambiente controlado sem login.
- [ ] Substituir policies temporárias por policies baseadas em Auth antes de produção pública.
- [ ] Antes de produção, habilitar RLS nas tabelas expostas.
- [ ] Criar policies por usuário/workspace com Supabase Auth.
- [ ] Criar tabela futura de membros de workspace.
- [ ] Impedir leitura cruzada entre workspaces.
- [ ] Impedir escrita em workspace não autorizado.

## Acesso indevido a dados

- [ ] Services sempre filtram por `workspace_id`.
- [ ] Rotas de detalhe validam se o registro pertence ao workspace atual.
- [ ] Relações cliente/projeto/orçamento devem pertencer ao mesmo workspace.
- [ ] Não confiar apenas em filtros do frontend na fase autenticada.

## Erros

- [ ] Não exibir stack trace ao usuário.
- [ ] Normalizar erros de services.
- [ ] Registrar detalhes técnicos somente em desenvolvimento.
- [ ] Mostrar mensagens claras e não sensíveis.

## Arquivos e PDF

- [ ] Gerar PDF apenas com dados do orçamento selecionado.
- [ ] Validar campos longos para não quebrar layout.
- [ ] Não incluir observações internas no PDF do cliente.
- [ ] Validar nome de arquivo exportado.

## Banco

- [ ] Constraints para valores monetários.
- [ ] Constraints para status.
- [ ] FKs em relações principais.
- [ ] Índices em campos de filtro.
- [ ] Trigger de `updated_at`.
- [ ] Revisar cascade delete apenas onde fizer sentido.

## Antes de produção pública

- [ ] Implementar Supabase Auth.
- [ ] Implementar RLS completa.
- [ ] Remover workspace temporário fixo.
- [ ] Revisar políticas com usuário comum.
- [ ] Testar tentativas de acesso entre workspaces.
- [ ] Revisar variáveis de ambiente no deploy.

## Supabase Auth

- [ ] Criar `/login`, `/register` e `/forgot-password`.
- [ ] Usar `@supabase/ssr` para sessão com cookies.
- [ ] Proteger rotas privadas no proxy/server side.
- [ ] Redirecionar usuário autenticado para dashboard ao acessar login/cadastro.
- [ ] Redirecionar usuário sem workspace para onboarding.
- [ ] Implementar logout real com `supabase.auth.signOut`.
- [ ] Limpar cache do TanStack Query no logout.

## RLS real

- [ ] Criar `profiles`.
- [ ] Criar `workspace_members`.
- [ ] Adicionar `owner_id` em `workspaces`.
- [ ] Remover policies temporárias `mvp_*`.
- [ ] Não permitir `anon` em tabelas de negócio.
- [ ] Criar policies `to authenticated`.
- [ ] Usar membership de workspace em `select`, `insert`, `update` e `delete`.
- [ ] Testar usuário B tentando acessar dados do usuário A.
- [ ] Criar funções auxiliares em schema não exposto.
