# Regression Checklist

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
