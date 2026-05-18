# Test Plan

## Objetivo

Validar que o MVP permite criar, organizar, calcular e exportar orçamentos com dados persistidos no Supabase, mantendo interface responsiva e operacional.

## Testes manuais principais

1. Abrir dashboard sem dados e verificar estado vazio.
2. Cadastrar cliente.
3. Editar cliente.
4. Inativar cliente com confirmação.
5. Cadastrar obra vinculada ao cliente.
6. Editar obra.
7. Cadastrar produto.
8. Cadastrar serviço.
9. Criar orçamento para cliente e obra.
10. Adicionar item do catálogo.
11. Adicionar item manual.
12. Alterar quantidade e preço.
13. Aplicar desconto.
14. Salvar como rascunho.
15. Alterar status para enviado.
16. Alterar status para aprovado.
17. Gerar PDF.
18. Reabrir orçamento salvo.
19. Verificar dashboard atualizado.
20. Testar busca e filtros.
21. Testar layout mobile.
22. Testar build final.

## Casos de sucesso

- Cliente válido é criado e aparece na listagem.
- Projeto válido é criado com cliente vinculado.
- Item de catálogo ativo aparece na seleção do orçamento.
- Orçamento com itens válidos é salvo.
- Totais são recalculados automaticamente.
- Status alterado registra histórico.
- PDF é gerado com dados corretos.
- Dashboard reflete totais reais.

## Casos de erro

- Cliente sem nome deve bloquear envio.
- Email inválido deve exibir erro.
- Projeto sem cliente deve bloquear envio.
- Orçamento sem cliente deve bloquear envio.
- Orçamento sem itens deve bloquear envio.
- Quantidade zero ou negativa deve bloquear item.
- Preço negativo deve bloquear item.
- Validade anterior à emissão deve bloquear envio.
- Falha do Supabase deve mostrar mensagem amigável.

## Estados vazios

- Dashboard sem dados.
- Clientes sem registros.
- Projetos sem registros.
- Catálogo sem itens.
- Orçamentos sem registros.
- Relatórios sem dados no período.
- Detalhes sem relacionamentos vinculados.

## Desktop

- Testar em largura ampla.
- Sidebar fixa deve permanecer acessível.
- Tabelas devem ser legíveis.
- Formulários não devem quebrar layout.
- Ações principais devem ficar visíveis no topo da página.

## Mobile

- Sidebar deve virar menu responsivo.
- Tabelas devem virar layout rolável ou compacto.
- Botões devem caber sem sobreposição.
- Formulários devem ser confortáveis em uma coluna.
- PDF deve poder ser acionado sem quebrar a tela.

## Persistência Supabase

- Criar registros e confirmar nas tabelas.
- Editar registros e confirmar `updated_at`.
- Inativar registros e confirmar `is_active = false`.
- Salvar orçamento e confirmar cabeçalho e itens.
- Alterar status e confirmar histórico.
- Reabrir aplicação e validar dados persistidos.

## Cálculo de orçamento

- `subtotal_item = quantidade * preço_unitário - desconto`.
- Subtotal do orçamento deve somar subtotais dos itens.
- Desconto total deve reduzir subtotal.
- Taxas/impostos devem aumentar total.
- Total final deve bater entre formulário, detalhe, dashboard e PDF.
- Valores devem ser formatados em BRL.

## PDF

- PDF com orçamento simples.
- PDF com muitos itens.
- PDF com escopo incluso e não incluso.
- PDF com desconto e impostos.
- Conferir dados do cliente, obra, datas e número.
- Conferir quebra de página e legibilidade.

## Regressão

- Rodar checklist de regressão antes da entrega.
- Confirmar ausência de erros no console.
- Confirmar build sem erros.
- Confirmar que nenhuma tela virou landing page ou marketing.

## Testes de autenticação

1. Abrir `/dashboard` sem sessão e confirmar redirect para `/login`.
2. Criar conta em `/register`.
3. Confirmar criação do usuário em Supabase Auth.
4. Confirmar criação automática em `profiles`.
5. Confirmar criação/vínculo de workspace inicial.
6. Fazer login com email/senha.
7. Confirmar redirect para `/dashboard`.
8. Atualizar a página e confirmar sessão persistente.
9. Fazer logout.
10. Tentar acessar `/clients` deslogado.
11. Solicitar recuperação de senha.
12. Testar login com senha inválida.
13. Testar cadastro com email já existente.

## Testes de isolamento por workspace

1. Criar usuário A.
2. Criar cliente, obra, item de catálogo e orçamento como usuário A.
3. Criar usuário B.
4. Confirmar que usuário B não vê dados do usuário A.
5. Tentar acessar detalhe por URL direta usando ID do usuário A.
6. Confirmar bloqueio por RLS.
7. Confirmar que dashboard do usuário B não soma dados do usuário A.
8. Confirmar que relatórios do usuário B não incluem dados do usuário A.

## Testes de migrations em banco limpo

1. Rodar schema inicial.
2. Rodar migration de Auth/SaaS.
3. Rodar policies reais.
4. Criar usuário via Auth.
5. Validar trigger de profile.
6. Validar criação de workspace inicial.
7. Validar CRUDs com RLS ativa.
