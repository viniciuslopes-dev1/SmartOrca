# Regression Checklist

## UI/UX global

- [ ] Header, sidebar e conteudo principal mantem alinhamento consistente.
- [ ] Menu lateral no mobile abre com backdrop e fecha corretamente.
- [ ] Botoes primarios e secundarios seguem padrao visual unico.
- [ ] Cards, toolbars e tabelas seguem o mesmo padrao de espacos e bordas.
- [ ] Estados de loading, erro e vazio estao legiveis e consistentes.
- [ ] Foco visivel em elementos interativos principais.
- [ ] Nao ha texto sobreposto em desktop e mobile.
- [ ] Nao ha quebra visual relevante com nomes longos.

## Navegação

- [ ] Dashboard abre corretamente.
- [ ] Sidebar funciona no desktop.
- [ ] Menu responsivo funciona no mobile.
- [ ] Links de clientes funcionam.
- [ ] Links de obras/projetos funcionam.
- [ ] Links de catálogo funcionam.
- [ ] Links de orçamentos funcionam.
- [ ] Links de relatórios funcionam.
- [ ] Breadcrumbs não apontam para rotas inválidas.

## CRUDs

- [ ] Cliente cria, edita, lista, detalha e inativa.
- [ ] Projeto cria, edita, lista e detalha.
- [ ] Projeto filtra por cliente e status.
- [ ] Item de catálogo cria, edita, lista e inativa.
- [ ] Orçamento cria, edita, lista, detalha e duplica.
- [ ] Ações destrutivas pedem confirmação.

## Cálculos

- [ ] Subtotal de item calcula corretamente.
- [ ] Desconto por item reduz subtotal.
- [ ] Subtotal do orçamento soma itens.
- [ ] Desconto total reduz total.
- [ ] Taxas aumentam total.
- [ ] Total exibido bate com total salvo.
- [ ] Valores aparecem em BRL.

## PDF

- [ ] PDF abre/baixa corretamente.
- [ ] Dados da empresa aparecem.
- [ ] Dados do cliente aparecem.
- [ ] Dados da obra aparecem quando houver.
- [ ] Itens aparecem com quantidade, unidade, preço e total.
- [ ] Condições e escopos aparecem.
- [ ] Observações internas não aparecem no PDF do cliente.

## Dashboard e relatórios

- [ ] Total de clientes correto.
- [ ] Total de obras/projetos correto.
- [ ] Total de orçamentos correto.
- [ ] Status de orçamento corretos.
- [ ] Valor total orçado correto.
- [ ] Valor total aprovado correto.
- [ ] Últimos orçamentos aparecem.
- [ ] Obras recentes aparecem.
- [ ] Relatórios não quebram sem dados.

## Responsividade

- [ ] Layout desktop sem sobreposição.
- [ ] Layout tablet legível.
- [ ] Layout mobile sem textos cortados.
- [ ] Tabelas continuam utilizáveis.
- [ ] Formulários cabem na tela.
- [ ] Botões não sobrepõem conteúdo.

## Supabase

- [ ] Dados persistem após refresh.
- [ ] Services filtram por workspace.
- [ ] `updated_at` muda em edições.
- [ ] Histórico de status é criado.
- [ ] Não há chamadas duplicadas excessivas.

## Qualidade

- [ ] Build sem erros.
- [ ] Lint sem erros críticos.
- [ ] Console do navegador sem erros.
- [ ] Estados loading, erro e vazio aparecem.
- [ ] UI continua industrial e sem aparência promocional.

## Autenticação

- [ ] `/login` renderiza sem `AppShell`.
- [ ] `/register` renderiza sem `AppShell`.
- [ ] `/forgot-password` renderiza sem `AppShell`.
- [ ] Usuário deslogado não acessa dashboard.
- [ ] Usuário logado não volta para login.
- [ ] Logout remove sessão.
- [ ] Refresh mantém sessão.
- [ ] Loading inicial não mostra dados antes de validar sessão.

## Isolamento

- [ ] Services usam workspace atual.
- [ ] Dashboard filtra pelo workspace atual.
- [ ] Relatórios filtram pelo workspace atual.
- [ ] Clientes não vazam entre usuários.
- [ ] Obras não vazam entre usuários.
- [ ] Catálogo não vaza entre usuários.
- [ ] Orçamentos e itens não vazam entre usuários.

## Orçamentos por grupos

- [ ] Orçamento novo cria grupos.
- [ ] Grupo de mão de obra aceita itens internos.
- [ ] Grupo de materiais aceita itens internos.
- [ ] Grupo de serviços aceita itens internos.
- [ ] Subtotal de item recalcula ao editar quantidade.
- [ ] Subtotal de item recalcula ao editar valor unitário.
- [ ] Subtotal do grupo soma apenas itens internos.
- [ ] Total geral soma todos os grupos.
- [ ] Remover item atualiza grupo e total.
- [ ] Remover grupo atualiza total.
- [ ] Salvar e reabrir preserva grupos e itens.
- [ ] Duplicar preserva grupos e itens.
- [ ] Orçamento antigo sem grupos abre com grupo padrão.
- [ ] PDF exibe grupos e subtotais.
- [ ] Relatórios e dashboard continuam somando o total salvo do orçamento.

## Importação de Excel

- [ ] `/catalog/import` abre sem erro.
- [ ] Upload de Excel gera prévia.
- [ ] Cabeçalhos diferentes são reconhecidos.
- [ ] Itens importados recebem tipo e unidade válidos.
- [ ] Salvar importa para `catalog_items`.
- [ ] Catálogo reflete itens importados.
- [ ] Importação não duplica chamadas de save durante a prévia.
- [ ] Erro de arquivo inválido é amigável.

## Regressao - orcamentos com branding
- [ ] Criacao/edicao de orcamento continua calculando subtotal/total corretamente.
- [ ] Orcamentos antigos abrem normalmente sem budget_layout.
- [ ] PDF continua gerando sem logo e sem layout definido.
- [ ] Filtros/listagens de orcamentos sem regressao.
- [ ] Settings gerais continuam salvando campos existentes.
