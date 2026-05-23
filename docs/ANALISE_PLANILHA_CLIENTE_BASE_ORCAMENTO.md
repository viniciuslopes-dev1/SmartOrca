# Análise da Planilha do Cliente - Base de Orçamento

Arquivo analisado:

```txt
C:/Users/vlope/Downloads/Base - Orçamento (Modelo).xlsx
```

## Resumo executivo

A planilha do cliente é uma base de orçamento orientada por **serviços tabelados**, não por composição detalhada de insumos.

Ela funciona assim:

```txt
Código do serviço
  ↓
Busca setor, descrição, unidade e valor unitário na base de serviços
  ↓
Usuário informa quantidade
  ↓
Calcula subtotal
  ↓
Aplica percentuais de indiretos e lucro
  ↓
Gera total por item e total por setor
```

O modelo atual não separa explicitamente material, mão de obra e insumos dentro de cada serviço. O custo já vem consolidado em uma linha de serviço.

Exemplo:

```txt
E-001 | Elétrica | Ponto elétrico simples | un | custo | coeficiente | valor unitário
```

Ou seja, para o cliente, "Ponto elétrico simples" já é um serviço pronto com preço de venda calculado.

## Abas encontradas

A planilha contém 5 abas:

```txt
1. Base Serviços - Original
2. Base Serviços - Flexível
3. Base Orçamento - Original
4. Base Orçamento - Flexível
5. Planilha1
```

`Planilha1` está vazia.

## Aba: Base Serviços - Original

Esta aba é o catálogo principal de serviços.

Colunas:

```txt
CÓDIGO
SETOR
DESCRIÇÃO
UN
VALOR CUSTO (R$)
COEF.
VALOR UNITÁRIO (R$)
```

Fórmula principal:

```txt
VALOR UNITÁRIO = VALOR CUSTO x COEF.
```

Exemplo:

```txt
Código: E-001
Setor: Elétrica
Descrição: Ponto elétrico simples
Unidade: un
Valor custo: 180
Coeficiente: 1,5
Valor unitário: 270
```

Interpretação:

```txt
R$ 180,00 é o custo base.
1,5 é um multiplicador comercial/técnico.
R$ 270,00 é o preço unitário do serviço antes de indiretos/lucro do orçamento.
```

### Quantidade de itens

Foram encontrados 85 serviços.

Distribuição por setor:

```txt
Elétrica: 10
Hidráulica: 11
Civil: 10
Pintura: 10
Drywall: 10
Porcelanataria: 10
Revestimentos: 11
Automação: 10
Limpeza: 3
```

Unidades usadas:

```txt
un: 33
ponto: 5
m²: 34
m: 11
ambiente: 1
Projeto: 1
```

Faixas observadas:

```txt
Menor custo: R$ 12,00
Maior custo: R$ 2.000,00
Custo médio aproximado: R$ 286,45

Menor valor unitário calculado: R$ 0,00
Maior valor unitário calculado: R$ 3.600,00
Valor unitário médio aproximado: R$ 503,81
```

Observação importante:

```txt
O item L-003 "Limpeza pesada pós-obra" aparece com valor unitário 0 na base original.
```

Isso parece erro ou célula não calculada/preenchida corretamente.

## Aba: Base Serviços - Flexível

Esta aba é uma segunda versão da base de serviços.

Ela tem a mesma estrutura da base original:

```txt
CÓDIGO
SETOR
DESCRIÇÃO
UN
VALOR CUSTO (R$)
COEF.
VALOR UNITÁRIO (R$)
```

Também possui 85 serviços, com os mesmos setores e códigos.

A diferença é que os custos e alguns coeficientes são menores ou ajustados.

Exemplo:

```txt
Original:
E-001 | Ponto elétrico simples | custo 180 | coef. 1,5 | valor 270

Flexível:
E-001 | Ponto elétrico simples | custo 120 | coef. 1,5 | valor 180
```

Interpretação:

```txt
A base original parece representar preço cheio/padrão.
A base flexível parece representar uma tabela mais negociável, econômica ou ajustável.
```

Faixas observadas:

```txt
Menor custo: R$ 10,00
Maior custo: R$ 1.400,00
Custo médio aproximado: R$ 211,05

Menor valor unitário calculado: R$ 16,00
Maior valor unitário calculado: R$ 2.520,00
Valor unitário médio aproximado: R$ 369,28
```

## Aba: Base Orçamento - Original

Esta aba monta o orçamento usando os códigos da base de serviços original.

Colunas principais:

```txt
CÓDIGO
SETOR
DESCRIÇÃO
UN
QUANT.
VALOR UNIT.
Subtotal
Indiretos
Lucro
TOTAL
```

Fórmulas principais:

```txt
SETOR = PROCV pelo código na Base Serviços
DESCRIÇÃO = PROCV pelo código na Base Serviços
UN = PROCV pelo código na Base Serviços
VALOR UNIT. = PROCV pelo código na Base Serviços
Subtotal = QUANT. x VALOR UNIT.
TOTAL = Subtotal / (1 - (Indiretos + Lucro))
```

Exemplo de fórmula:

```txt
Subtotal = E2 * F2
TOTAL = G2 / (1 - (H2 + I2))
```

Na base original, a maioria dos itens tem:

```txt
Indiretos: 12%
Lucro: 30%
```

Isso significa que a planilha não soma lucro em cima do subtotal de forma simples.

Ela usa a fórmula:

```txt
total = subtotal / (1 - percentual_total)
```

Exemplo:

```txt
Subtotal: R$ 270,00
Indiretos: 12%
Lucro: 30%
Percentual total: 42%

Total = 270 / (1 - 0,42)
Total = 270 / 0,58
Total = R$ 465,52
```

Essa lógica é parecida com cálculo "por dentro", em que a margem desejada representa parte do preço final, não apenas acréscimo em cima do custo.

## Aba: Base Orçamento - Flexível

Esta aba usa a base flexível para preço unitário.

Ela mantém a mesma lógica:

```txt
Código do serviço
Busca dados
Quantidade
Subtotal
Indiretos
Lucro
Total
```

Diferenças observadas:

- O valor unitário vem da `Base Serviços - Flexível`.
- Alguns campos de indiretos aparecem vazios.
- O lucro geralmente aparece como `30%`.
- Em alguns itens de limpeza, lucro aparece como `20%`.
- Nos itens finais de limpeza, as quantidades foram alteradas para 35, 25 e 30.

Exemplo:

```txt
L-001 | Limpeza pós-obra (Fina) | quantidade 35 | valor unit. 15 | indiretos 12% | lucro 20%
L-002 | Remoção de Entulho | quantidade 25 | valor unit. 20 | lucro 20%
L-003 | Limpeza pesada pós-obra | quantidade 30 | valor unit. buscado na base flexível | lucro 20%
```

## Resumo lateral da planilha

As abas de orçamento possuem um resumo nas colunas N:P.

Ele soma totais por setor:

```txt
Serviços de elétrica
Serviços de hidráulica
Serviços de civil
Serviços de pintura
Serviços de drywall
Serviços de porcelanataria
Serviços de revestimentos
Serviços de automação
Serviços de limpeza
```

Na aba original, o total geral vem de:

```txt
J87 = SUM(J2:J86)
```

E o resumo busca:

```txt
Valor Total = J87
```

Também existem subtotais por faixa de linhas:

```txt
Elétrica: SUM(J2:J11)
Hidráulica: SUM(J12:J22)
Civil: SUM(J23:J32)
Pintura: SUM(J33:J42)
Drywall: SUM(J43:J52)
Porcelanataria: SUM(J53:J62)
Revestimentos: SUM(J63:J73)
Automação: SUM(J74:J83)
Limpeza: SUM(J84:J86)
```

## Como essa planilha pensa o orçamento

Ela não trabalha com composições detalhadas.

Ela trabalha assim:

```txt
Serviço pronto
  ↓
Custo base
  ↓
Coeficiente comercial
  ↓
Preço unitário
  ↓
Quantidade
  ↓
Subtotal
  ↓
Indiretos + lucro
  ↓
Total final
```

Então, para esse cliente, um serviço como:

```txt
Ponto elétrico simples
```

Já embute tudo que ele considera necessário:

- Material.
- Mão de obra.
- Deslocamento.
- Complexidade.
- Risco.
- Experiência do prestador.

Mas esses componentes não aparecem separados.

## Diferença para uma composição técnica completa

Na composição técnica ideal, um serviço seria assim:

```txt
Ponto elétrico simples
  - Cabo
  - Eletroduto
  - Caixa
  - Tomada/interruptor
  - Eletricista
  - Ajudante
  - Ferramentas
  - Perdas
```

Nesta planilha, ele aparece assim:

```txt
Ponto elétrico simples
  - Custo consolidado: R$ 180
  - Coeficiente: 1,5
  - Valor unitário: R$ 270
```

Ou seja, ela está um nível acima: é uma tabela de serviços parametrizados, não uma tabela de insumos detalhados.

## Como importar essa planilha para o SmartOrça

### Importação inicial recomendada

Importar as abas:

```txt
Base Serviços - Original
Base Serviços - Flexível
```

Como catálogo de serviços.

Mapeamento:

```txt
CÓDIGO              -> external_code
SETOR               -> category
DESCRIÇÃO           -> name
UN                  -> unit
VALOR CUSTO (R$)    -> cost_unit
COEF.               -> default_margin ou pricing_coefficient
VALOR UNITÁRIO (R$) -> price_unit
```

No modelo atual do SmartOrça, `catalog_items` não tem `external_code` nem `pricing_coefficient`. Então existem duas opções.

### Opção simples

Importar assim:

```txt
name = DESCRIÇÃO
type = service
unit = UN
category = SETOR
cost_unit = VALOR CUSTO
price_unit = VALOR UNITÁRIO
default_margin = COEF.
notes = CÓDIGO + origem da tabela
```

Vantagem:

- Funciona com o schema atual.
- Permite usar rapidamente no orçamento.

Limitação:

- `COEF.` não é exatamente margem percentual.
- Código externo fica improvisado em observações.

### Opção ideal

Evoluir o schema do catálogo:

```txt
catalog_items
  external_code
  pricing_coefficient
  source_table
  source_file_name
```

Assim a importação fica fiel:

```txt
external_code = E-001
category = Elétrica
name = Ponto elétrico simples
unit = un
cost_unit = 180
pricing_coefficient = 1.5
price_unit = 270
source_table = Base Serviços - Original
```

## Como importar a aba de orçamento

As abas `Base Orçamento - Original` e `Base Orçamento - Flexível` podem virar um orçamento pronto.

Mapeamento:

```txt
CÓDIGO       -> budget_items.catalog/external_code
SETOR        -> grupo/categoria
DESCRIÇÃO    -> item name
UN           -> unit
QUANT.       -> quantity
VALOR UNIT.  -> price_unit
Subtotal     -> subtotal antes de indiretos/lucro
Indiretos    -> overhead_percentage
Lucro        -> profit_percentage
TOTAL        -> total final do item
```

Ponto importante:

O SmartOrça hoje calcula:

```txt
subtotal_item = quantidade x preço_unitário - desconto
```

Mas a planilha calcula:

```txt
total_item = subtotal / (1 - (indiretos + lucro))
```

Então, para reproduzir essa planilha corretamente, o sistema precisa evoluir para armazenar:

```txt
overhead_percentage
profit_percentage
pricing_method
```

Ou então transformar o `TOTAL` da planilha em `price_unit` final no momento da importação.

## Fórmula de preço encontrada

Fórmula atual da planilha:

```txt
TOTAL = SUBTOTAL / (1 - (INDIRETOS + LUCRO))
```

Onde:

```txt
SUBTOTAL = QUANTIDADE x VALOR UNITÁRIO
```

Exemplo conceitual:

```txt
Quantidade: 1
Valor unitário: R$ 270
Subtotal: R$ 270
Indiretos: 12%
Lucro: 30%

Total = 270 / (1 - 0,42)
Total = R$ 465,52
```

Isso é diferente de:

```txt
270 x 1,42 = R$ 383,40
```

Portanto, se o sistema usar acréscimo simples, vai dar diferença.

## Problemas e riscos encontrados na planilha

### 1. Referências externas quebráveis

Algumas fórmulas de unidade usam referências como:

```txt
'[1]Base de Serviços'!A1:G86
```

Isso parece referência a outro arquivo ou versão anterior. Pode quebrar se o arquivo for movido ou importado.

Para importação, é melhor não depender dessas fórmulas externas. O sistema deve ler os valores finais e/ou buscar na própria base.

### 2. Campos vazios de indiretos

Na aba flexível, vários itens têm `Indiretos` vazio.

A fórmula:

```txt
TOTAL = G / (1 - (H + I))
```

Pode tratar vazio como zero no Excel, mas no sistema isso precisa ser normalizado para `0`.

### 3. `COEF.` não é margem percentual

O coeficiente 1,5 significa multiplicador, não margem de 1,5%.

Então não deve ser importado diretamente para `default_margin` como percentual sem cuidado.

Melhor:

```txt
pricing_coefficient = 1.5
```

### 4. Serviço com valor zerado

Na base original, `L-003 Limpeza pesada pós-obra` aparece com preço unitário `0`.

Isso deve gerar alerta na importação.

### 5. Orçamento baseado em faixas fixas de linha

O resumo soma setores por intervalos fixos:

```txt
Elétrica = linhas 2 a 11
Hidráulica = linhas 12 a 22
...
```

No sistema, isso deve ser substituído por soma por `category/setor`, não por número de linha.

## Modelo de importação recomendado para essa planilha

### Passo 1 - Upload

Usuário sobe:

```txt
Base - Orçamento (Modelo).xlsx
```

### Passo 2 - Escolha do tipo de importação

O sistema pergunta:

```txt
O que deseja importar?

[ ] Catálogo de serviços
[ ] Orçamento pronto
[ ] Ambos
```

### Passo 3 - Escolha da aba

Para catálogo:

```txt
Base Serviços - Original
Base Serviços - Flexível
```

Para orçamento:

```txt
Base Orçamento - Original
Base Orçamento - Flexível
```

### Passo 4 - Mapeamento automático

O sistema identifica:

```txt
CÓDIGO -> Código externo
SETOR -> Categoria
DESCRIÇÃO -> Nome
UN -> Unidade
VALOR CUSTO -> Custo
COEF. -> Coeficiente de preço
VALOR UNITÁRIO -> Preço unitário
```

### Passo 5 - Preview

Mostrar:

```txt
85 serviços encontrados
9 setores encontrados
6 tipos de unidade encontrados
1 item com valor zerado
```

### Passo 6 - Importação

Criar ou atualizar itens no catálogo.

Regra anti-duplicidade:

```txt
workspace_id + external_code + source_table
```

Se o schema ainda não tiver esses campos, usar:

```txt
workspace_id + name + category + unit
```

### Passo 7 - Uso no orçamento

No orçamento, o usuário poderá digitar:

```txt
E-001
```

Ou buscar:

```txt
Ponto elétrico simples
```

E o sistema já puxa:

```txt
Setor
Descrição
Unidade
Preço unitário
```

## Como isso melhora o SmartOrça

Com essa importação, o cliente não precisa recadastrar 85 serviços manualmente.

Ele sobe a planilha, revisa e passa a ter:

- Catálogo pronto.
- Serviços categorizados.
- Códigos preservados.
- Preços preservados.
- Base original e flexível reaproveitadas.
- Orçamentos mais rápidos.

## Implicações para funcionalidades futuras

### Campos novos sugeridos em `catalog_items`

```txt
external_code text
pricing_coefficient numeric(10,4)
source_table text
source_file_name text
```

### Campos novos sugeridos em `budget_items`

```txt
external_code text
category text
overhead_percentage numeric(8,4)
profit_percentage numeric(8,4)
pricing_method text
base_subtotal numeric(14,2)
```

### Tabelas novas sugeridas

```txt
catalog_imports
catalog_import_rows
import_templates
```

Essas tabelas permitiriam histórico, auditoria e reaproveitamento do mapeamento.

## Conclusão

Essa planilha é um ótimo candidato para importação automatizada.

Ela tem estrutura consistente:

- Códigos padronizados.
- Setores bem definidos.
- Serviços por linha.
- Unidades claras.
- Preço por custo x coeficiente.
- Orçamento por código + quantidade.
- Resumo por setor.

O ponto principal é que o sistema deve tratar essa planilha como uma **tabela de serviços prontos**, não como uma composição detalhada de materiais e mão de obra.

Para este cliente, o primeiro importador deveria focar em:

```txt
Excel -> Catálogo de Serviços -> Orçamento rápido por código/serviço
```

Depois, em uma evolução posterior, o SmartOrça pode permitir que esses serviços sejam transformados em composições detalhadas com materiais, mão de obra e equipamentos.
