# Design Improvement Plan

## Objetivo

Elevar consistencia visual, legibilidade e ergonomia de uso sem alterar regras de negocio, rotas, dados ou fluxos funcionais.

## Prioridades

1. **P0 - Fundacao visual compartilhada**
   - Padronizar classes de superficie, toolbar e tabela.
   - Melhorar shell global (sidebar, header, backdrop mobile).
   - Consolidar estilos de feedback (loading, erro, vazio).

2. **P1 - Telas principais**
   - Aplicar padrao nas listagens: `clients`, `projects`, `catalog`, `budgets`.
   - Aplicar padrao no `dashboard` e `reports`.
   - Garantir hierarquia clara em titulos, acoes e blocos de informacao.

3. **P1 - Formulario e configuracoes**
   - Melhorar leitura de secoes e agrupamento visual.
   - Garantir consistencia de botoes e mensagens de retorno.

4. **P2 - Refinos responsivos**
   - Ajustar spacing e overflow em breakpoints menores.
   - Revisar acessibilidade basica (foco, contraste, alvo de toque).

## Plano de execucao

1. Auditar estrutura e mapear problemas (concluido).
2. Criar documentacao obrigatoria em `docs/` (concluido).
3. Implementar padroes globais de layout/estilo.
4. Atualizar telas principais para reaproveitar os novos padroes.
5. Revisar estados de loading/erro/vazio.
6. Executar build e checks basicos.
7. Atualizar checklist e plano de teste para regressao focada em UI/UX.

## Componentes-alvo da padronizacao

- `src/components/layout/app-shell.tsx`
- `src/components/layout/page-header.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`
- `src/components/feedback/data-state.tsx`
- `src/app/globals.css`
- Telas de listagem e dashboard/reports/settings

## Criterios de sucesso

- Interface mais coesa entre telas.
- Melhor contraste e hierarquia visual.
- Experiencia mobile mais previsivel na navegacao principal.
- Menos duplicacao de classes utilitarias de layout em paginas.
- Nenhuma regressao funcional em CRUDs, autenticacao e navegacao.
