# Estudo - Fluxo de Obras e Orçamentos

## Objetivo do estudo

Este documento explica como funciona, na prática, o orçamento de obras e serviços de construção/reforma, com foco em pequenos negócios, prestadores de serviço, engenheiros, autônomos e empresas que fazem propostas para clientes finais.

A principal conclusão é: em orçamento de obra, o item vendido ao cliente normalmente não deve ser tratado apenas como "material" ou apenas como "mão de obra". O item principal costuma ser um **serviço executável**, e esse serviço pode conter materiais, mão de obra, equipamentos, perdas, transporte, descarte, impostos, margem e prazo.

Exemplo:

> "Refazer o piso da sala" é um serviço.  
> Dentro dele podem existir remoção do piso antigo, descarte de entulho, regularização do contrapiso, argamassa, piso, rejunte, espaçadores, mão de obra, ferramentas, tempo de execução, limpeza e margem.

## Fontes e referências usadas

- SINAPI/CAIXA: sistema brasileiro de referência para custos e composições da construção civil.  
  https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/Paginas/default.aspx
- SINAPI Metodologias e Conceitos, CAIXA.  
  https://www.caixa.gov.br/Downloads/sinapi-metodologia/Livro_SINAPI_Metodologias_Conceitos.pdf
- SINAPI Cálculos e Parâmetros, CAIXA.  
  https://www.caixa.gov.br/Downloads/sinapi-metodologia/Livro_SINAPI_Calculos_Parametros.pdf
- IBGE SINAPI.  
  https://www.ibge.gov.br/estatisticas/todos-os-produtos-estatisticas/9270-sistema-nacional-de-pesquisa-de-custos-e-indices-da-construcao-civil.html
- TCU - Orientações para Elaboração de Planilhas Orçamentárias de Obras Públicas.  
  https://portal.tcu.gov.br/publicacoes-institucionais/cartilha-manual-ou-tutorial/orientacoes-para-elaboracao-de-planilhas-orcamentarias-de-obras-publicas
- TCU - Obras Públicas: recomendações básicas para contratação e fiscalização.  
  https://portal.tcu.gov.br/publicacoes-institucionais/cartilha-manual-ou-tutorial/obras-publicas-recomendacoes-basicas-para-a-contratacao-e-fiscalizacao-de-obras-de-edificacoes-publicas

## Como pensar o orçamento de obra

Um orçamento de obra é a conversão de um escopo técnico em preço de venda.

Ele responde:

- O que será feito?
- Onde será feito?
- Em que quantidade?
- Com qual padrão de acabamento?
- Com quais materiais?
- Com qual equipe?
- Em quanto tempo?
- Com quais riscos?
- Com quais custos diretos?
- Com quais custos indiretos?
- Com qual margem?
- Com quais condições comerciais?

O TCU descreve o processo de orçamento em três grandes etapas:

1. Levantamento e quantificação dos serviços.
2. Avaliação dos custos unitários.
3. Definição de BDI/margem e formação do preço de venda.

Para um SaaS de orçamentos, isso significa que a tela de orçamento precisa permitir mais do que uma lista simples de produtos. Ela deve permitir estruturar serviços, composições e insumos.

## Hierarquia real de um orçamento

A estrutura mais útil para o sistema é:

```txt
Workspace / Empresa
  Cliente
    Obra / Projeto
      Orçamento
        Grupo / Etapa / Ambiente
          Serviço orçado
            Composição do serviço
              Insumos
                Material
                Mão de obra
                Equipamento
                Terceiro / subempreita
                Despesa direta
```

Exemplo:

```txt
Cliente: João Pereira
Obra: Reforma apartamento 42
Orçamento: Reforma sala e cozinha
Etapa: Piso
Serviço: Refazer piso porcelanato
Composição:
  - Remoção do piso antigo
  - Carga e descarte de entulho
  - Regularização de contrapiso
  - Argamassa ACIII
  - Porcelanato
  - Rejunte
  - Espaçadores/niveladores
  - Pedreiro
  - Servente
  - Cortadora/serra
  - Limpeza final
```

## Diferença entre material, mão de obra e serviço

### Material

Material é o insumo físico que será consumido ou incorporado à obra.

Exemplos:

- Cimento.
- Areia.
- Piso.
- Argamassa.
- Rejunte.
- Tinta.
- Tubo.
- Fio.
- Porta.
- Janela.

Material pode ser vendido de duas formas:

- Como item direto no orçamento: "20 caixas de piso".
- Dentro de uma composição de serviço: "assentamento de porcelanato por m²".

### Mão de obra

Mão de obra é o tempo de trabalho necessário para executar o serviço.

Exemplos:

- Pedreiro por hora/dia.
- Servente por hora/dia.
- Pintor por m² ou diária.
- Eletricista por ponto ou diária.
- Encanador por ponto ou diária.

Em orçamento técnico, mão de obra costuma entrar com coeficiente de produtividade.

Exemplo simples:

```txt
Serviço: assentamento de piso cerâmico
Unidade: m²
Coeficiente pedreiro: 0,45 h por m²
Coeficiente servente: 0,25 h por m²
Quantidade: 30 m²
Pedreiro: 30 x 0,45 = 13,5 h
Servente: 30 x 0,25 = 7,5 h
```

### Serviço

Serviço é a unidade vendida/executada. Ele representa uma entrega concreta para o cliente.

Exemplos:

- Refazer piso.
- Pintar parede.
- Instalar porta.
- Executar contrapiso.
- Fazer ponto elétrico.
- Trocar vaso sanitário.
- Impermeabilizar banheiro.
- Executar alvenaria.

O serviço pode ser:

- Simples: apenas mão de obra.
- Composto: materiais + mão de obra + equipamentos.
- Terceirizado: preço de subcontratado.
- Verba: item estimado sem detalhamento completo.

Para o sistema, o serviço deve ser o item principal do orçamento, e os materiais/mão de obra podem ser detalhes internos dele.

## Conceito de composição de serviço

Composição é a receita de custo de um serviço.

Ela define quais insumos entram e em qual quantidade por unidade de serviço.

Exemplo genérico:

```txt
Serviço: Assentamento de piso cerâmico
Unidade do serviço: m²

Insumos por 1 m²:
  - Piso cerâmico: 1,08 m²
  - Argamassa: 4,50 kg
  - Rejunte: 0,20 kg
  - Pedreiro: 0,45 h
  - Servente: 0,25 h
  - Cortadora/equipamento: 0,03 h
```

O coeficiente 1,08 m² de piso para 1 m² executado representa perda, recorte ou sobra técnica. Esse ponto é essencial: a quantidade comprada pode ser maior que a quantidade medida.

Fórmula:

```txt
custo_unitário_serviço =
  soma(coeficiente_insumo x custo_unitário_insumo)
```

Depois:

```txt
custo_total_serviço =
  quantidade_serviço x custo_unitário_serviço
```

Preço de venda:

```txt
preço_venda =
  custo_direto + custos_indiretos + impostos + risco + lucro/margem
```

## Exemplo completo: "Refazer o piso"

### Escopo do cliente

Cliente pede:

```txt
Refazer o piso da sala de 30 m².
```

Esse pedido precisa virar serviços orçamentáveis.

### Quebra técnica do serviço

```txt
Etapa: Piso

1. Remover piso existente
   Unidade: m²
   Quantidade: 30

2. Retirar e descartar entulho
   Unidade: m³ ou viagem
   Quantidade: estimada conforme volume

3. Regularizar contrapiso
   Unidade: m²
   Quantidade: 30

4. Assentar piso novo
   Unidade: m²
   Quantidade: 30

5. Aplicar rejunte
   Unidade: m²
   Quantidade: 30

6. Instalar rodapé
   Unidade: metro linear
   Quantidade: perímetro do ambiente

7. Limpeza final
   Unidade: serviço ou m²
   Quantidade: 1 serviço ou 30 m²
```

### Dentro de "assentar piso novo"

```txt
Serviço: Assentamento de piso porcelanato
Unidade: m²
Quantidade: 30 m²

Materiais:
  - Porcelanato
  - Argamassa
  - Rejunte
  - Espaçadores/niveladores
  - Água/consumíveis

Mão de obra:
  - Pedreiro
  - Servente

Equipamentos/ferramentas:
  - Cortadora
  - Desempenadeira
  - Balde/misturador

Perdas:
  - Piso: 5% a 15%, conforme paginação, recortes e padrão
  - Argamassa/rejunte: perda técnica conforme consumo real

Riscos:
  - Contrapiso irregular
  - Peça quebrada
  - Rodapé fora do escopo
  - Necessidade de nivelamento adicional
```

### Como isso deve aparecer para o cliente

Existem dois níveis possíveis de apresentação.

#### Apresentação sintética

```txt
Refazer piso porcelanato da sala - 30 m² - R$ X
Inclui remoção, regularização, assentamento, rejunte e limpeza.
```

Boa para cliente final, simples e objetiva.

#### Apresentação analítica

```txt
Remoção de piso existente - 30 m² - R$ X
Regularização de contrapiso - 30 m² - R$ X
Assentamento de porcelanato - 30 m² - R$ X
Rejuntamento - 30 m² - R$ X
Rodapé - 28 m - R$ X
Limpeza final - 1 serviço - R$ X
```

Boa para obra maior, cliente técnico, auditoria, financiamento, obra pública ou contrato mais formal.

O sistema deve permitir as duas visões: uma visão interna detalhada e uma visão externa mais limpa para PDF.

## Tipos de item que o sistema deve suportar

### 1. Serviço composto

É o mais importante para obras.

Exemplo:

```txt
Assentamento de piso porcelanato - m²
```

Contém:

- Materiais.
- Mão de obra.
- Equipamentos.
- Perdas.
- Produtividade.
- Margem.

### 2. Serviço simples

Não detalha todos os insumos, mas ainda é uma entrega.

Exemplo:

```txt
Instalação de chuveiro - unidade
```

Pode ter apenas:

- Mão de obra.
- Pequenos materiais inclusos.

### 3. Material direto

Quando o profissional vende/fornece o material separadamente.

Exemplo:

```txt
Piso porcelanato 80x80 - m²
```

### 4. Mão de obra avulsa

Quando o orçamento é por diária, hora ou equipe.

Exemplo:

```txt
Pedreiro - diária
Servente - diária
Eletricista - hora
```

### 5. Equipamento

Quando há locação ou uso relevante.

Exemplo:

```txt
Betoneira - diária
Andaime - diária
Caçamba de entulho - unidade
```

### 6. Terceiro/subcontratado

Quando parte do serviço é feita por outra empresa/profissional.

Exemplo:

```txt
Marmoraria - bancada instalada
Vidraçaria - box instalado
Marcenaria - móvel sob medida
```

### 7. Verba

Item estimativo usado quando ainda não há detalhe suficiente.

Exemplo:

```txt
Verba para adequações hidráulicas - R$ 2.000
```

Deve ser usado com cuidado, pois aumenta risco e reduz precisão.

## Como o fluxo de orçamento funciona na prática

### 1. Entrada da demanda

O cliente chega com uma necessidade:

- "Quero reformar o banheiro."
- "Preciso trocar o piso."
- "Quero pintar a casa."
- "Tenho uma infiltração."
- "Preciso de um orçamento para obra nova."

Nessa etapa o sistema deve registrar:

- Cliente.
- Obra/projeto.
- Local.
- Tipo de serviço.
- Urgência.
- Observações.
- Fotos/anexos futuramente.

### 2. Vistoria ou levantamento

O profissional mede e entende a situação real.

Informações importantes:

- Área em m².
- Comprimento em metro linear.
- Quantidade de pontos.
- Altura.
- Estado da base.
- Acesso ao local.
- Se há demolição.
- Se há descarte.
- Se o cliente fornece material.
- Se existem interferências.

Sem levantamento, o orçamento vira chute.

### 3. Definição de escopo

Escopo é o que está incluso e o que não está incluso.

Exemplo incluso:

```txt
Inclui remoção do piso existente, regularização simples, assentamento de porcelanato, rejunte e limpeza básica.
```

Exemplo não incluso:

```txt
Não inclui impermeabilização, troca de contrapiso estrutural, correção de vazamentos, fornecimento do porcelanato ou alteração elétrica.
```

Escopo é uma proteção comercial. Evita que o cliente entenda que "refazer piso" inclui tudo que aparecer no caminho.

### 4. Estrutura analítica do orçamento

O orçamento é quebrado em etapas:

- Serviços preliminares.
- Demolições.
- Estrutura.
- Alvenaria.
- Instalações elétricas.
- Instalações hidráulicas.
- Revestimentos.
- Pisos.
- Pintura.
- Esquadrias.
- Louças/metais.
- Limpeza.
- Administração local.

Para obras pequenas, pode ser por ambiente:

- Banheiro.
- Cozinha.
- Sala.
- Quarto.
- Área externa.

### 5. Quantificação

Cada serviço precisa de quantidade e unidade.

Exemplos:

```txt
Pintura de parede: m²
Rodapé: metro linear
Tomada: unidade/ponto
Concreto: m³
Forma: m²
Aço: kg
Limpeza: serviço
Caçamba: unidade
Pedreiro: diária/hora
```

Erro comum: misturar unidade de compra com unidade de execução.

Exemplo:

- Piso é comprado em caixa ou m².
- Assentamento é medido em m².
- Rodapé é medido em metro linear.

### 6. Composição de custo

Para cada serviço, o sistema deve permitir:

```txt
Serviço
  Quantidade executada
  Unidade
  Composição
    Insumo
    Tipo do insumo
    Coeficiente
    Unidade do insumo
    Custo unitário
    Custo total
```

Exemplo:

```txt
Serviço: Pintura acrílica em parede
Unidade: m²

Insumos por m²:
  Tinta: 0,18 L
  Massa corrida: 0,30 kg
  Lixa: 0,05 un
  Pintor: 0,25 h
  Servente: 0,10 h
```

### 7. Custos diretos

Custos diretos são aqueles ligados diretamente à execução.

Exemplos:

- Materiais aplicados.
- Mão de obra produtiva.
- Equipamentos usados.
- Transporte específico.
- Caçamba.
- Subempreiteiro.
- EPIs específicos da obra.
- Administração local quando quantificável.

Segundo orientações do TCU, itens como administração local, canteiro, mobilização e desmobilização, quando mensuráveis, devem aparecer na planilha como custo direto, não escondidos no BDI.

### 8. Custos indiretos, BDI e margem

Além do custo direto, existe o custo de manter a empresa funcionando e o lucro esperado.

Componentes comuns:

- Administração central.
- Despesas financeiras.
- Seguros.
- Garantias.
- Tributos.
- Riscos.
- Lucro/margem.

Em obras públicas, usa-se o conceito de BDI com composição demonstrável. Em obras privadas pequenas, o profissional muitas vezes chama isso de margem, taxa administrativa ou percentual comercial.

Para o sistema, faz sentido permitir:

- Margem por item.
- Margem geral do orçamento.
- Taxas/impostos.
- Desconto.
- BDI separado em versão futura.

### 9. Formação do preço de venda

Fluxo simples:

```txt
1. Calcular custo direto dos serviços.
2. Somar custos indiretos aplicáveis.
3. Aplicar impostos/taxas.
4. Aplicar margem/lucro.
5. Ajustar desconto comercial, se houver.
6. Gerar preço final.
```

Fórmula simplificada:

```txt
subtotal = soma(serviços)
total = subtotal - descontos + taxas + margem
```

Fórmula mais técnica:

```txt
preço_unitário_venda = custo_unitário_direto x (1 + BDI)
preço_total = quantidade x preço_unitário_venda
```

O SaaS atual pode começar simples, mas deve estar preparado para evoluir para BDI estruturado.

## O que muda no cadastro de produtos/serviços do SaaS

O cadastro atual de catálogo não deve ser apenas uma lista plana.

Modelo recomendado:

```txt
catalog_items
  - item simples
  - serviço
  - material
  - mão de obra
  - equipamento
  - terceiro

service_compositions
  - serviço principal
  - insumos vinculados
  - coeficientes
```

Ou seja:

- `catalog_items` guarda itens reutilizáveis.
- Um item do tipo `serviço` pode ter uma composição.
- A composição aponta para outros itens do catálogo como insumos.

Exemplo:

```txt
catalog_items
  ID 1 - Assentamento de porcelanato - tipo: serviço - unidade: m²
  ID 2 - Porcelanato - tipo: material - unidade: m²
  ID 3 - Argamassa ACIII - tipo: material - unidade: kg
  ID 4 - Rejunte - tipo: material - unidade: kg
  ID 5 - Pedreiro - tipo: mão de obra - unidade: hora
  ID 6 - Servente - tipo: mão de obra - unidade: hora

service_composition_items
  Serviço ID 1 usa ID 2 com coeficiente 1,08
  Serviço ID 1 usa ID 3 com coeficiente 4,50
  Serviço ID 1 usa ID 4 com coeficiente 0,20
  Serviço ID 1 usa ID 5 com coeficiente 0,45
  Serviço ID 1 usa ID 6 com coeficiente 0,25
```

## Diferença entre orçamento interno e proposta para o cliente

### Orçamento interno

Deve mostrar:

- Custo de material.
- Custo de mão de obra.
- Custo de equipamento.
- Custo de terceiro.
- Margem.
- Lucro estimado.
- Riscos.
- Observações internas.
- Preço mínimo aceitável.

### Proposta para o cliente

Deve mostrar:

- Serviço.
- Quantidade.
- Unidade.
- Preço unitário.
- Total.
- Escopo incluso.
- Escopo não incluso.
- Prazo.
- Validade.
- Condições de pagamento.
- Observações comerciais.

Nem sempre é bom mostrar cada insumo ao cliente. Em muitos casos, mostrar insumo demais gera discussão de preço unitário de material e esconde o valor técnico da execução.

## Estados comerciais do orçamento

Status úteis:

- Rascunho.
- Em análise interna.
- Enviado.
- Em negociação.
- Aprovado.
- Recusado.
- Expirado.
- Cancelado.

O SaaS atual já tem parte desses status. Futuramente pode adicionar "em negociação".

## Aprovação e transformação em obra

Quando um orçamento é aprovado, ele pode virar:

- Contrato.
- Ordem de serviço.
- Cronograma.
- Lista de compras.
- Planejamento de equipe.
- Medições.
- Controle de custo real vs orçado.

Esse é um caminho natural de evolução do produto.

## Controle durante a execução

Um bom orçamento não serve apenas para vender. Ele vira base para controlar a obra.

Comparações importantes:

```txt
Orçado x Realizado
Material previsto x Material comprado
Mão de obra prevista x Horas executadas
Prazo previsto x Prazo real
Margem prevista x Margem real
```

Para isso, o sistema pode evoluir para:

- Lista de compras por orçamento.
- Apontamento de horas.
- Registro de despesas reais.
- Controle de medições.
- Aditivos de contrato.

## Aditivos e mudanças de escopo

Obra muda. O orçamento precisa lidar com isso.

Exemplos:

- Cliente troca o piso por um modelo mais caro.
- Contrapiso estava ruim e precisa refazer.
- Surge vazamento.
- Cliente aumenta o escopo.
- Há serviço não previsto.

O sistema deve futuramente permitir:

- Criar aditivo do orçamento.
- Registrar motivo da mudança.
- Comparar orçamento original vs revisão.
- Controlar versão da proposta.

## Pontos chave para desenhar o SaaS corretamente

### 1. Serviço deve ser entidade principal do orçamento

O cliente compra uma entrega, não apenas uma lista de materiais.

### 2. Material e mão de obra são insumos do serviço

Eles formam o custo interno e a composição.

### 3. Um orçamento precisa de visão sintética e analítica

Sintética para cliente. Analítica para controle interno.

### 4. Quantidade e unidade são críticas

Sem unidade correta, o orçamento fica inconsistente.

### 5. Coeficiente é o coração da composição

Ele diz quanto de cada insumo é necessário por unidade de serviço.

### 6. Perda técnica precisa existir

Piso, tinta, argamassa, cabos e tubos quase sempre têm perdas.

### 7. Produtividade afeta custo e prazo

Quanto uma equipe faz por dia/hora define mão de obra e cronograma.

### 8. Escopo incluso/não incluso evita conflito

Todo orçamento de obra deve deixar limites claros.

### 9. Margem não é o mesmo que custo

Custo é quanto a empresa gasta. Preço é quanto ela cobra.

### 10. RLS/workspace no SaaS protege dados de obras e clientes

Orçamentos são dados comerciais sensíveis. O isolamento por workspace é essencial.

## Implicações para o banco de dados futuro

Além das tabelas atuais, considerar:

```txt
budget_groups
  id
  budget_id
  name
  sort_order

service_compositions
  id
  workspace_id
  catalog_item_id
  name
  unit
  notes

service_composition_items
  id
  composition_id
  catalog_item_id
  item_type
  coefficient
  waste_percentage
  unit_cost
  sort_order

budget_item_inputs
  id
  budget_item_id
  catalog_item_id
  item_type
  coefficient
  quantity
  unit_cost
  total_cost
```

Com isso, um orçamento pode guardar:

- O serviço vendido.
- A composição usada naquele momento.
- O custo congelado da época da proposta.
- A diferença entre preço de catálogo atual e preço usado no orçamento.

## Implicações para a interface

### Cadastro de catálogo

Deve permitir:

- Criar material.
- Criar mão de obra.
- Criar equipamento.
- Criar serviço.
- Para serviço, montar composição.

### Tela de orçamento

Deve permitir:

- Adicionar serviço pronto do catálogo.
- Expandir serviço e ver composição interna.
- Alterar quantidade.
- Ajustar coeficientes no orçamento sem alterar o catálogo original.
- Adicionar item manual.
- Definir se a composição aparece ou não no PDF.

### PDF

Deve permitir modo:

- Sintético: mostra apenas serviços.
- Analítico: mostra serviços e insumos.

## Exemplo de estrutura ideal para o SaaS

```txt
Orçamento #45 - Reforma apartamento

Grupo: Sala
  Serviço: Refazer piso porcelanato
    Unidade: m²
    Quantidade: 30
    Preço unitário: R$ 180
    Total: R$ 5.400

    Composição interna:
      Material: porcelanato - 32,4 m²
      Material: argamassa - 135 kg
      Material: rejunte - 6 kg
      Mão de obra: pedreiro - 13,5 h
      Mão de obra: servente - 7,5 h
      Equipamento: cortadora - 0,9 h

Grupo: Cozinha
  Serviço: Pintura teto
  Serviço: Troca de tomadas
```

## Recomendação para evolução do SmartOrça

### Curto prazo

- Manter item manual e item de catálogo.
- Melhorar tipos de item.
- Separar claramente serviço, material, mão de obra e equipamento.
- Adicionar grupo/etapa no orçamento.

### Médio prazo

- Criar composição de serviço.
- Permitir insumos dentro de serviços.
- Calcular custo interno e preço de venda separadamente.
- Criar PDF sintético/analítico.

### Longo prazo

- Importar bases de referência como SINAPI.
- Criar listas de compra.
- Controlar custo real vs orçado.
- Criar cronograma físico-financeiro.
- Criar aditivos/revisões de orçamento.
- Medir produtividade real da equipe.

## Conclusão

Para obra, o orçamento mais correto não é uma lista plana de produtos. O modelo mais fiel é:

```txt
Cliente quer uma entrega.
Entrega vira serviço.
Serviço tem composição.
Composição tem insumos.
Insumos geram custo.
Custo recebe margem/BDI.
Preço vira proposta.
Proposta aprovada vira obra.
Obra executada gera controle real.
```

Portanto, o SmartOrça deve evoluir para tratar o orçamento como uma estrutura técnica de serviços compostos, mantendo uma apresentação simples para o cliente final.
