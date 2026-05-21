# Test Plan

## Objetivo

Validar que o sistema continua funcional apos a melhoria de UI/UX, mantendo regras de negocio, navegacao e integridade dos fluxos principais.

## Telas e fluxos cobertos

- Login, registro e recuperacao de senha
- Dashboard
- Clientes (lista, criar, editar, detalhe, inativar)
- Obras/projetos (lista, criar, editar, detalhe)
- Catalogo (lista, criar, editar, detalhe, importar)
- Orcamentos (lista, criar, editar, detalhe, duplicar, PDF)
- Relatorios
- Configuracoes

## Cobertura de UI/UX (rodada atual)

1. Validar coerencia visual entre dashboard, listagens, relatorios e configuracoes.
2. Validar padrao de botoes primarios/secundarios nas telas principais.
3. Validar consistencia de cards, toolbars e tabelas nas listagens.
4. Validar estados de loading/erro/vazio em ao menos uma tela de cada modulo.
5. Validar navegacao principal no mobile com abertura/fechamento da sidebar.
6. Validar legibilidade e contraste de textos de apoio, badges e links de acao.

## Testes manuais obrigatorios

1. Login e logout.
2. Navegacao principal por sidebar/header.
3. Dashboard carregando com e sem dados.
4. CRUD completo de cliente.
5. CRUD completo de obra/projeto.
6. CRUD completo de catalogo.
7. CRUD completo de orcamento.
8. Busca e filtros nas listagens.
9. Estados de erro simulando falha de requisicao.
10. Estados vazios sem registros.
11. Confirmacoes de acoes destrutivas.
12. Layout em desktop amplo, notebook e mobile.
13. Console do navegador sem erros relevantes.
14. Build de producao sem erro.

## Critérios de aprovacao

- Nenhuma funcionalidade removida.
- Nenhuma regra de negocio alterada.
- Nenhuma rota principal quebrada.
- Melhorias visuais aplicadas com consistencia.
- Responsividade melhor que a baseline anterior.

## Testes manuais - logo e layouts
- Upload de logo valido (png/jpg/jpeg/webp) e exibicao imediata.
- Upload invalido (tipo/arquivo maior que 2MB) com erro amigavel.
- Remocao de logo sem quebrar preview.
- Troca de layout padrao e persistencia entre recargas.
- Novo orcamento herda layout padrao; edicao permite trocar layout por orcamento.
- PDF gerado com layout aplicado e fallback sem logo.
