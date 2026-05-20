# SDD - Software Design Document

## Visão geral

O produto é um SaaS web para criação, gestão e acompanhamento de orçamentos para pequenos negócios, engenheiros, prestadores de serviço, autônomos e profissionais que trabalham sozinhos. O MVP prioriza o fluxo operacional: cadastrar clientes, registrar obras/projetos, manter produtos e serviços reutilizáveis, montar orçamentos, calcular totais, acompanhar status e gerar PDF.

Não haverá login no MVP. A modelagem e a arquitetura devem, porém, preparar o sistema para autenticação, workspaces e isolamento multiusuário em fase futura.

## Problema

Profissionais pequenos costumam perder histórico de orçamentos, repetir cálculos em planilhas, refazer propostas antigas manualmente e ter pouca visibilidade sobre valores aprovados, pendentes e recusados. O sistema reduz retrabalho, centraliza dados no Supabase e organiza o funil de orçamentos.

## Público-alvo

- Prestadores de serviço.
- Pequenos engenheiros e técnicos.
- Autônomos que fazem orçamentos recorrentes.
- Pequenas empresas de obra, manutenção, instalação ou serviços.
- Pessoas que precisam de organização sem complexidade de ERP completo.

## Módulos principais

- Dashboard operacional.
- Clientes.
- Obras/projetos.
- Produtos e serviços.
- Orçamentos.
- PDF de orçamento.
- Relatórios básicos.
- Configurações da empresa/prestador.

## Fluxo do usuário

1. O usuário abre o dashboard.
2. Cadastra ou consulta um cliente.
3. Cadastra uma obra/projeto vinculada ao cliente.
4. Cadastra produtos ou serviços reutilizáveis.
5. Cria um orçamento para cliente e obra.
6. Adiciona itens do catálogo ou itens manuais.
7. Ajusta quantidades, preços, descontos, escopo e condições.
8. Salva como rascunho ou altera status para enviado.
9. Gera PDF.
10. Atualiza status para aprovado, recusado, expirado ou cancelado.
11. Acompanha indicadores no dashboard e relatórios.

## Regras de negócio

- Todo dado persistente deve ser salvo no Supabase.
- Orçamentos sempre pertencem a um workspace.
- Clientes, projetos e catálogo também pertencem a um workspace.
- Orçamento deve ter cliente.
- Projeto é opcional no orçamento, mas quando informado deve pertencer ao mesmo workspace e cliente coerente.
- Orçamento salvo deve ter ao menos um item.
- Item deve ter quantidade maior que zero.
- Valores monetários não devem ser negativos, exceto quando a regra permitir desconto como campo separado.
- Validade do orçamento não pode ser anterior à data de emissão.
- Status válidos do orçamento: `draft`, `sent`, `approved`, `rejected`, `expired`, `cancelled`.
- Mudanças de status devem registrar histórico em `budget_status_history`.
- Exclusões destrutivas devem pedir confirmação.
- Cliente, projeto e item de catálogo devem preferir inativação a exclusão física.
- Cálculos devem ser centralizados para evitar divergência entre tela, persistência e PDF.

## Entidades principais

- `workspaces`: empresa/prestador dono dos dados.
- `clients`: clientes atendidos.
- `projects`: obras/projetos vinculados a clientes.
- `catalog_items`: produtos, serviços, mão de obra, materiais, equipamentos e taxas.
- `budgets`: cabeçalho, status, escopo, condições e totais do orçamento.
- `budget_items`: itens calculáveis do orçamento.
- `budget_status_history`: trilha simples de alterações de status.
- `settings`: dados padrão da empresa e preferências de orçamento.
- `budget_exports`: registro opcional de PDFs gerados.

## Comportamento esperado

- A interface deve abrir diretamente no dashboard, sem landing page.
- Telas com dados devem exibir estados de loading, erro e vazio.
- CRUDs devem ter busca, filtros relevantes e feedback de sucesso/erro.
- O dashboard deve usar dados reais do Supabase.
- O PDF deve refletir os dados salvos e totais calculados.
- O layout deve ser denso, industrial, responsivo e orientado a produtividade.

## Riscos técnicos

- MVP sem login reduz segurança real se exposto publicamente.
- RLS precisa ser planejado para não bloquear o MVP e não criar falsa sensação de segurança.
- Cálculos monetários podem divergir se forem duplicados em vários pontos.
- PDF no frontend pode ter limitações de layout, performance ou compatibilidade.
- Relatórios podem ficar lentos se consultas não forem indexadas.
- Tipos do Supabase podem ficar defasados se não houver rotina de geração.

## Decisões importantes

- Usar Next.js com App Router, TypeScript e Tailwind CSS.
- Usar Supabase como backend principal.
- Centralizar chamadas Supabase em services e hooks.
- Usar Zod para validação e React Hook Form nos formulários.
- Usar TanStack Query para cache e estados assíncronos.
- Usar `@react-pdf/renderer` para PDF no frontend no MVP.
- Preparar `workspace_id` desde o início.
- Não criar login, checkout, assinatura ou página comercial no MVP.

## Critérios de aceite

- Todos os documentos técnicos obrigatórios existem antes da implementação.
- O projeto não contém implementação antes da aprovação.
- Após aprovação, o MVP deve permitir CRUD de clientes, projetos e catálogo.
- Orçamentos devem ser criados, editados, duplicados, status alterado e PDF gerado.
- Dashboard e relatórios devem refletir dados do Supabase.
- Build deve concluir sem erros.
- A interface deve ser industrial, operacional e responsiva.
- Não deve haver tela de login ou landing page no MVP.

## Atualização - Autenticação e SaaS multiworkspace

O próximo incremento transforma o MVP sem login em uma aplicação autenticada com Supabase Auth. A nova versão deve manter os módulos existentes, mas adicionar autenticação, sessão persistente e isolamento por workspace.

### Problemas atuais identificados

- Não existem telas `/login`, `/register` ou `/forgot-password`.
- Todas as rotas operacionais são acessíveis sem sessão.
- `AppShell` envolve todas as rotas no layout raiz, o que não atende telas públicas de Auth.
- Services usam `DEFAULT_WORKSPACE_ID` fixo.
- Não existem tabelas `profiles` e `workspace_members`.
- `workspaces` ainda não tem `owner_id`.
- Policies temporárias `mvp_*` permitem acesso do papel `anon` ao workspace padrão.

### Escopo funcional novo

- Login com email e senha via Supabase Auth.
- Cadastro com nome, email, senha, confirmação, telefone opcional e nome da empresa.
- Logout.
- Recuperação de senha por email.
- Proteção das rotas operacionais.
- Criação ou conclusão de workspace inicial após autenticação.
- Isolamento de clientes, obras, catálogo, orçamentos, dashboard e relatórios por workspace.

### Novas entidades

- `profiles`: dados públicos/controlados do usuário autenticado.
- `workspace_members`: vínculo entre usuários e workspaces com role.

### Regras de negócio adicionais

- Usuário sem login não acessa dados operacionais.
- Usuário autenticado deve pertencer a um workspace para usar o sistema.
- Todo registro de negócio deve pertencer ao workspace atual.
- Usuário não pode ver dados de workspaces em que não é membro.
- Apenas owner/admin pode alterar configurações sensíveis e gerenciar membros.
- Policies temporárias do MVP devem ser removidas/substituídas.

### Critérios de aceite adicionais

- Login, cadastro e logout funcionando.
- Profile criado automaticamente por trigger em `auth.users`.
- Workspace inicial criado por fluxo autenticado.
- RLS ativa em todas as tabelas de negócio.
- Policies usam `authenticated` e membership de workspace.
- Dashboard e relatórios mostram apenas dados do workspace atual.
- Usuário B não acessa dados do usuário A.

## Atualização - Orçamento por grupos baseado na planilha analisada

### Situação atual encontrada no código

O módulo de orçamento já permite criar, editar, duplicar, visualizar e gerar PDF de orçamentos. A estrutura atual, porém, trabalha com uma lista única de `budget_items`, sem separação nativa por seções. O formulário `BudgetForm` usa `items[]`, o service `budgets.service.ts` salva os itens em `budget_items`, e os cálculos em `lib/calculations/budget.ts` somam todos os itens diretamente.

### Aprendizado aproveitado da planilha do cliente

A planilha enviada mostra que o orçamento real de obra não é apenas uma lista simples. Ela separa serviços por setor/categoria, usa unidades variadas, calcula subtotal por quantidade e valor unitário, e organiza o total por grupos como elétrica, hidráulica, civil, pintura, drywall, revestimentos e limpeza. A lógica útil para o sistema é a separação operacional por grupos, não o layout do Excel.

### Novo fluxo funcional

O usuário deverá montar um orçamento em camadas:

1. Dados gerais do orçamento.
2. Grupos ou seções do orçamento.
3. Itens dentro de cada grupo.
4. Subtotal por grupo.
5. Total geral do orçamento.

Grupos esperados no MVP:

- Mão de obra.
- Materiais.
- Serviços.
- Produtos.
- Etapa da obra.
- Outros.

Cada grupo poderá representar uma categoria operacional, uma etapa da obra ou um agrupamento livre definido pelo usuário.

### Regras de negócio novas

- Todo orçamento deve ter ao menos um grupo com ao menos um item para ser salvo.
- Cada item pertence a um grupo.
- O subtotal do item é calculado por `quantidade * valor_unitario - desconto`.
- O subtotal do grupo é a soma dos subtotais dos itens daquele grupo.
- O subtotal do orçamento é a soma dos subtotais dos grupos.
- Desconto total e taxas do orçamento continuam sendo aplicados no cabeçalho do orçamento.
- Itens antigos sem grupo devem ser tratados como compatibilidade em um grupo padrão chamado "Itens do orçamento".
- O usuário pode adicionar, editar, remover e reordenar grupos e itens.
- A tela não deve copiar a planilha nem parecer Excel; a planilha serve apenas como referência de lógica.

### Comportamento esperado

- Ao abrir um orçamento antigo, o sistema exibe os itens existentes dentro de um grupo padrão sem perda de dados.
- Ao criar um orçamento novo, o sistema sugere um primeiro grupo, por exemplo "Mão de obra" ou "Serviços".
- Ao selecionar item de catálogo, o sistema pode sugerir o grupo pelo tipo do item, mas o usuário pode alterar.
- Ao alterar quantidade, valor unitário ou desconto, o subtotal do item, do grupo e do orçamento é recalculado imediatamente.
- Ao remover um grupo, o sistema pede confirmação porque todos os itens internos serão removidos.

### Riscos e cuidados

- Migration deve preservar `budget_items` existentes.
- RLS deve proteger `budget_groups` pelo orçamento pai e workspace.
- PDF, visualização e relatórios precisam continuar funcionando com orçamentos antigos e novos.
- A atualização deve evitar duplicar regra de cálculo em JSX.

### Critérios de aceite do incremento

- Criar orçamento com múltiplos grupos.
- Criar grupo de mão de obra e adicionar itens internos.
- Criar grupos de materiais e serviços.
- Calcular subtotal por item, por grupo e total geral.
- Editar e remover itens sem quebrar totais.
- Remover grupos com confirmação.
- Salvar e reabrir orçamento preservando grupos e itens.
- Orçamentos antigos continuam abrindo.
- PDF/visualização continuam úteis com a nova estrutura.

## Atualização - Importação de itens por Excel

O catálogo passa a ter uma tela de importação para que o usuário envie a planilha usada atualmente e transforme linhas de serviço, mão de obra, materiais ou insumos em itens reutilizáveis.

Regras:

- A importação não copia a planilha visualmente.
- O sistema tenta reconhecer colunas com nomes diferentes.
- Colunas esperadas ou equivalentes: código, setor/categoria, descrição/nome, unidade, custo, preço, coeficiente, tipo e observações.
- Antes de salvar, o usuário vê uma prévia com avisos.
- Somente após confirmação os itens são inseridos em `catalog_items`.
- Cada item importado recebe `workspace_id` pelo service autenticado.
- A origem da linha fica registrada em `notes` para auditoria operacional.

Critérios de aceite:

- Subir arquivo `.xlsx`, `.xls` ou `.csv`.
- Detectar itens mesmo com cabeçalhos diferentes.
- Inferir tipo e unidade quando possível.
- Calcular preço por `custo * coeficiente` quando não houver preço explícito.
- Salvar itens no catálogo do workspace atual.
- Não salvar nada antes da confirmação do usuário.
