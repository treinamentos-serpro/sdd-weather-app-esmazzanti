# Especificação do Weather App

## 1. Overview

### 1.1 Visão do produto

O Weather App é uma aplicação web responsiva que permite buscar cidades e
consultar o clima atual e a previsão dos próximos cinco dias. O MVP será
disponibilizado em português do Brasil, sem autenticação e sem persistência de
dados em servidor.

### 1.2 Objetivo

Permitir que uma pessoa encontre rapidamente as condições meteorológicas de uma
cidade e use a previsão para planejar deslocamentos, viagens e atividades dos
próximos dias.

### 1.3 Personas

- **Marina, profissional em deslocamento:** precisa decidir rapidamente se deve
  levar guarda-chuva ou adaptar o trajeto, principalmente pelo celular.
- **Rafael, planejador de atividades:** analisa a previsão dos próximos dias em
  desktop ou tablet antes de planejar passeios, viagens ou atividades ao ar
  livre.
- **Aisha, usuária internacional:** pesquisa cidades de diferentes países e
  precisa diferenciar resultados homônimos e usar uma unidade familiar.

### 1.4 Indicadores de sucesso

- Em teste de usabilidade, pelo menos 90% dos participantes encontram uma
  cidade e identificam a previsão em até 30 segundos, sem repetir a busca.
- Em teste de usabilidade, pelo menos 90% dos participantes localizam a
  previsão de hoje e dos quatro dias seguintes.
- Em teste de usabilidade, pelo menos 90% dos participantes diferenciam cidades
  homônimas e identificam corretamente a unidade exibida.

### 1.5 Definições do produto

- **Cidade selecionada:** resultado de geocoding escolhido pelo usuário, com
  identificador, latitude e longitude válidos.
- **Dia da previsão:** data no fuso horário retornado para a cidade. A janela
  padrão contém hoje e os quatro dias seguintes, totalizando cinco dias.
- **Campo obrigatório:** dado necessário para renderizar uma seção com
  segurança. Para o clima atual, são obrigatórios cidade, latitude, longitude,
  temperatura e condição climática. Para cada dia, são obrigatórios data,
  temperatura mínima, temperatura máxima e condição climática.
- **Campo opcional:** dado que pode ser exibido quando retornado, mas cuja
  ausência não invalida a resposta: país, região, ícone, sensação térmica,
  umidade, vento, horário de atualização e probabilidade de precipitação.
- **Retry manual:** nova tentativa iniciada explicitamente pelo usuário. O
  sistema não deve repetir automaticamente uma requisição que falhou.
- **Cache válido:** resposta armazenada por até 10 minutos para a mesma consulta
  normalizada. O botão Atualizar sempre ignora o cache.
- **Dado obsoleto:** resposta meteorológica com mais de 10 minutos e no máximo
  1 hora de idade. Pode ser exibida somente durante uma falha do provedor, com
  aviso explícito.

## 2. Functional Requirements

### RF01. Buscar cidades

O sistema deve permitir pesquisar cidades por nome, incluindo caracteres
acentuados e outros caracteres Unicode válidos. O valor deve ser removido de
espaços nas extremidades, ter espaços consecutivos normalizados e conter entre 1
e 100 caracteres Unicode após a normalização. A busca deve ser iniciada pelo
botão de busca ou pela tecla Enter.

### RF02. Exibir resultados de busca

O sistema deve exibir no máximo 10 resultados, ordenados por relevância da
fonte de geocoding. Cada resultado deve exibir cidade e, quando disponíveis,
região ou estado e país, além de permanecer associado ao identificador,
latitude e longitude retornados pela fonte.

O MVP aceita cidades de qualquer país. A interface, mensagens e descrições
continuam em português do Brasil.

### RF03. Selecionar cidade

O usuário deve poder selecionar uma cidade por mouse, toque ou teclado. Um
resultado só pode ser selecionado se possuir latitude e longitude válidos.

### RF04. Exibir clima atual

Para a cidade selecionada, o sistema deve exibir:

- nome da cidade e país;
- temperatura atual;
- condição climática e ícone representativo;
- sensação térmica;
- umidade;
- velocidade do vento;
- horário da última atualização.

Cidade, temperatura e condição climática são obrigatórios para exibir o clima
atual. Campos opcionais ausentes devem permanecer visíveis com o valor
`Indisponível`. O sistema não deve inventar valores.

### RF05. Exibir previsão de cinco dias

O sistema deve exibir a previsão diária de hoje e dos quatro dias seguintes em
ordem cronológica. Cada dia deve apresentar data, condição climática,
temperatura mínima e máxima. Ícone e probabilidade de precipitação devem ser
exibidos quando disponíveis. Se a fonte retornar menos de cinco dias, o sistema
deve exibir os dias disponíveis e informar que a previsão está incompleta.

O contrato de previsão deve solicitar `forecast_days=5`, `timezone=auto`,
`temperature_unit=celsius` ou `fahrenheit`, e os campos atuais e diários
necessários para cumprir as definições de dados obrigatórios e opcionais.

Quando o fuso horário não estiver presente na resposta, o sistema deve usar as
datas diárias retornadas sem recalculá-las no fuso do dispositivo e exibir o
horário de atualização como `Indisponível`.

### RF06. Alternar unidade de temperatura

O usuário deve poder alternar entre Celsius e Fahrenheit. A unidade selecionada
deve ser aplicada ao clima atual, à sensação térmica e a todos os valores de
temperatura da previsão. A conversão deve usar $F = C * 9 / 5 + 32$ e
$C = (F - 32) * 5 / 9$; os valores exibidos devem ter uma casa decimal, salvo
quando o resultado for inteiro.

### RF07. Persistir unidade no navegador

O sistema deve preservar a preferência de unidade no navegador atual usando a
chave `weather-app:unit`. Apenas os valores válidos
`celsius` e `fahrenheit` devem ser aceitos; na ausência de uma preferência
válida, a unidade padrão deve ser Celsius.

### RF08. Informar estados da aplicação

O sistema deve informar visualmente e por tecnologia assistiva os estados de
inicial, carregamento, sucesso, ausência de resultados, cidade não selecionada,
erro de validação, erro de busca e erro meteorológico. Cada erro deve informar
se o usuário pode corrigir a entrada ou realizar um retry manual.

### RF09. Repetir consultas

O usuário deve poder fazer uma nova busca e selecionar outra cidade sem
recarregar a página. Para a cidade selecionada, deve existir um botão
`Atualizar` que realiza uma nova consulta ignorando o cache válido.

### RF10. Tratar falhas de integração

Em caso de falha de conexão, indisponibilidade da fonte meteorológica, timeout
ou resposta inválida, o sistema deve encerrar o carregamento, exibir uma
mensagem em português e oferecer retry manual quando o erro for recuperável. O
timeout de uma requisição é de 8 segundos. Respostas HTTP 4xx não devem ser
repetidas automaticamente; respostas HTTP 5xx, timeout e falhas de rede devem
permitir retry manual.

Quando uma consulta falhar e existir dado obsoleto com no máximo 1 hora, o
sistema deve exibi-lo com a mensagem `Dados possivelmente desatualizados` e o
horário da última atualização. Dados com mais de 1 hora não devem ser exibidos
como previsão atual.

As integrações do MVP são:

- Geocoding: endpoint de busca da Open-Meteo, com nome normalizado, idioma
  `pt`, limite de 10 resultados e retorno em JSON.
- Previsão: endpoint de forecast da Open-Meteo, usando latitude, longitude,
  `current` e `daily`, `timezone=auto`, cinco dias e a unidade selecionada.
- Códigos WMO suportados: `0`, `1`, `2`, `3`, `45`, `48`, `51` a `57`, `61` a
  `67`, `71` a `77`, `80` a `82`, `85`, `86`, `95`, `96` e `99`.
- Mapeamento WMO para texto pt-BR e identificador semântico de ícone:

  | Códigos | Texto | Ícone |
  |---|---|---|
  | `0` | Céu limpo | `clear` |
  | `1` | Predominantemente limpo | `mostly-clear` |
  | `2` | Parcialmente nublado | `partly-cloudy` |
  | `3` | Nublado | `cloudy` |
  | `45`, `48` | Nevoeiro | `fog` |
  | `51`, `53`, `55` | Chuvisco | `drizzle` |
  | `56`, `57` | Chuvisco congelante | `freezing-drizzle` |
  | `61`, `63`, `65` | Chuva | `rain` |
  | `66`, `67` | Chuva congelante | `freezing-rain` |
  | `71`, `73`, `75`, `77` | Neve | `snow` |
  | `80`, `81`, `82` | Pancadas de chuva | `rain-showers` |
  | `85`, `86` | Pancadas de neve | `snow-showers` |
  | `95`, `96`, `99` | Tempestade | `thunderstorm` |

- Código WMO desconhecido: exibir texto e ícone `Indisponível`, preservar os
  demais dados válidos e registrar falha técnica sem invalidar a previsão.
- A interface deve exibir no rodapé a atribuição `Dados meteorológicos:
  Open-Meteo.com` quando houver dados meteorológicos.

## 3. User Stories

### US01. Buscar uma cidade

Como Marina, quero buscar uma cidade pelo nome para consultar rapidamente as
condições do meu deslocamento.

### US02. Diferenciar cidades

Como Aisha, quero ver região ou estado e país nos resultados para selecionar a
cidade correta quando houver nomes semelhantes.

### US03. Consultar o clima atual

Como Marina, quero consultar as condições atuais de uma cidade para adaptar meu
trajeto e decidir o que levar.

### US04. Consultar os próximos dias

Como Rafael, quero ver a previsão de hoje e dos quatro dias seguintes para
planejar atividades ao ar livre.

### US05. Escolher unidade de temperatura

Como Aisha, quero alternar entre Celsius e Fahrenheit para interpretar os
valores na unidade que conheço.

### US06. Retomar minha preferência

Como usuário recorrente, quero que minha unidade escolhida seja mantida entre
acessos no mesmo navegador para não precisar configurá-la novamente.

### US07. Recuperar-se de estados de espera e erro

Como usuário, quero receber feedback durante carregamentos, resultados vazios e
falhas para entender o estado da consulta e saber quando tentar novamente.

### US08. Fazer novas consultas

Como usuário, quero pesquisar outra cidade sem recarregar a página para comparar
ou consultar destinos diferentes com agilidade.

## 4. Acceptance Criteria

Os critérios abaixo usam `Given`, `When` e `Then` para permitir a conversão
direta em testes automatizados.

### RF01. Buscar cidades

- **AC-RF01-01.** **Given** que o campo de busca contém `São Paulo`, **When** o usuário envia a
  busca, **Then** o sistema solicita cidades usando esse texto e exibe o estado
  de carregamento.
- **AC-RF01-02.** **Given** que o campo de busca contém apenas espaços, **When** o usuário envia
  a busca, **Then** o sistema não realiza chamada à API e informa que o nome da
  cidade deve ser preenchido.
- **AC-RF01-03.** **Given** que o campo de busca contém mais de 100 caracteres após a
  normalização, **When** o usuário envia a busca, **Then** o sistema não realiza
  chamada à API e informa o limite permitido.
- **AC-RF01-04.** **Given** que o campo de busca contém caracteres acentuados, **When** o
  usuário envia a busca, **Then** o texto é enviado com codificação UTF-8 e a
  interface não exibe erro de validação por causa do acento.
- **AC-RF01-05.** **Given** que uma busca está em andamento, **When** o usuário tenta enviá-la
  novamente, **Then** o sistema não cria chamadas duplicadas para a mesma busca.

### RF02. Exibir resultados de busca

- **AC-RF02-01.** **Given** que a API retorna cidades com nome, região e país, **When** a busca
  termina, **Then** cada resultado exibe esses três campos.
- **AC-RF02-02.** **Given** que a API não fornece região ou país para um resultado, **When** os
  resultados são exibidos, **Then** o sistema mostra os campos disponíveis e
  exibe `Indisponível` para cada campo ausente, sem inventar valores.
- **AC-RF02-03.** **Given** que a API retorna cidades homônimas, **When** a lista é exibida,
  **Then** os resultados permanecem separados e mostram o contexto disponível
  para diferenciá-los.
- **AC-RF02-04.** **Given** que a API não retorna resultados, **When** a busca termina, **Then**
  o sistema exibe uma mensagem de ausência de resultados e não exibe uma
  previsão para a busca.

### RF03. Selecionar cidade

- **AC-RF03-01.** **Given** que a lista contém pelo menos um resultado selecionável, **When** o
  usuário seleciona um resultado, **Then** o sistema inicia a consulta
  meteorológica usando o identificador e as coordenadas desse resultado.
- **AC-RF03-02.** **Given** que o usuário selecionou uma cidade, **When** a consulta
  meteorológica termina, **Then** os dados exibidos correspondem à cidade
  selecionada e não apenas ao texto original da busca.
- **AC-RF03-03.** **Given** que não há resultados selecionáveis, **When** o usuário tenta
  consultar o clima, **Then** o sistema não inicia uma consulta meteorológica.

### RF04. Exibir clima atual

- **AC-RF04-01.** **Given** que uma cidade selecionada retorna clima atual completo, **When** a
  consulta termina, **Then** o sistema exibe nome da cidade, país, temperatura,
  condição climática e ícone representativo.
- **AC-RF04-02.** **Given** que a resposta fornece sensação térmica, umidade, velocidade do
  vento e horário da última atualização, **When** o clima é exibido, **Then**
  cada valor aparece associado à cidade selecionada.
- **AC-RF04-03.** **Given** que um campo opcional do clima atual está ausente, **When** os dados
  são exibidos, **Then** o campo permanece visível com o valor `Indisponível`.
- **AC-RF04-04.** **Given** que um campo obrigatório do clima atual está ausente ou inválido,
  **When** a resposta é processada, **Then** o sistema informa que os dados não
  puderam ser processados e não inventa um valor substituto.

### RF05. Exibir previsão de cinco dias

- **AC-RF05-01.** **Given** que a fonte retorna dados para hoje e para os quatro dias seguintes,
  **When** a consulta termina, **Then** o sistema exibe exatamente cinco dias
  em ordem cronológica.
- **AC-RF05-02.** **Given** que um dia possui data, condição, mínima, máxima, ícone e
  probabilidade de precipitação, **When** a previsão é exibida, **Then** todos
  esses valores aparecem nesse dia.
- **AC-RF05-03.** **Given** que a fonte retorna menos de cinco dias, **When** a previsão é
  exibida, **Then** o sistema mostra apenas os dias disponíveis e informa que a
  previsão está incompleta.
- **AC-RF05-04.** **Given** que a cidade selecionada possui resposta em cache com até 10 minutos,
  **When** o usuário consulta a cidade sem usar `Atualizar`, **Then** o sistema
  exibe a resposta em cache sem realizar nova chamada ao provedor.
- **AC-RF05-05.** **Given** que o usuário aciona `Atualizar`, **When** a consulta é iniciada,
  **Then** o sistema ignora o cache, realiza nova chamada e atualiza o horário
  da previsão quando a resposta é válida.
- **AC-RF05-06.** **Given** que a fonte retorna o fuso horário da cidade, **When** datas e
  horários são formatados, **Then** o sistema usa o fuso retornado em vez do
  fuso local do dispositivo.
- **AC-RF05-07.** **Given** que a fonte não retorna o fuso horário, **When** a previsão é
  exibida, **Then** o sistema usa as datas diárias recebidas sem recalculá-las e
  exibe o horário de atualização como `Indisponível`.

### RF06. Alternar unidade de temperatura

- **AC-RF06-01.** **Given** que a interface exibe temperaturas em Celsius, **When** o usuário
  seleciona Fahrenheit, **Then** todas as temperaturas atuais e previstas são
  exibidas em Fahrenheit e com o indicador correspondente.
- **AC-RF06-02.** **Given** que a interface exibe temperaturas em Fahrenheit, **When** o usuário
  seleciona Celsius, **Then** todas as temperaturas atuais e previstas são
  exibidas em Celsius e com o indicador correspondente.
- **AC-RF06-03.** **Given** que uma temperatura em Celsius é `0`, **When** o usuário seleciona
  Fahrenheit, **Then** o sistema exibe `32 °F` para esse valor.
- **AC-RF06-04.** **Given** que o usuário altera a unidade, **When** a conversão é realizada,
  **Then** os valores são arredondados para uma casa decimal em toda a
  interface, exceto quando o resultado for inteiro.

### RF07. Persistir unidade no navegador

- **AC-RF07-01.** **Given** que o usuário seleciona Celsius ou Fahrenheit, **When** a seleção é
  confirmada, **Then** o sistema armazena somente o valor correspondente
  (`celsius` ou `fahrenheit`) no armazenamento local.
- **AC-RF07-02.** **Given** que existe uma preferência válida no mesmo navegador e origin,
  **When** o usuário recarrega a aplicação, **Then** a unidade armazenada é
  restaurada antes da exibição dos valores meteorológicos.
- **AC-RF07-03.** **Given** que a preferência está ausente ou contém um valor diferente de
  `celsius` e `fahrenheit`, **When** a aplicação é inicializada, **Then** a
  unidade utilizada é Celsius.
- **AC-RF07-04.** **Given** que o armazenamento local não pode ser lido ou escrito, **When** a
  aplicação inicializa ou o usuário altera a unidade, **Then** a aplicação
  continua funcionando durante a sessão usando a unidade selecionada.

### RF08. Informar estados da aplicação

- **AC-RF08-01.** **Given** que nenhuma cidade foi selecionada, **When** a aplicação é exibida,
  **Then** a área de previsão informa que não há cidade selecionada.
- **AC-RF08-02.** **Given** que uma busca ou consulta meteorológica está em andamento, **When**
  o estado de carregamento é exibido, **Then** a interface mostra um indicador
  visual e comunica o estado a tecnologias assistivas.
- **AC-RF08-03.** **Given** que a busca termina sem resultados, **When** o estado vazio é
  exibido, **Then** a interface informa que nenhuma cidade foi encontrada e
  mantém o controle de nova busca disponível.
- **AC-RF08-04.** **Given** que ocorre uma falha de rede, timeout ou erro da fonte, **When** a
  operação termina, **Then** a interface exibe uma mensagem específica para o
  erro e mantém uma ação de nova tentativa quando a falha for recuperável.
- **AC-RF08-05.** **Given** que uma consulta termina com dados válidos, **When** o estado de
  sucesso é exibido, **Then** a interface mostra os dados da cidade selecionada
  e não mantém o indicador de carregamento.

### RF09. Repetir consultas

- **AC-RF09-01.** **Given** que uma cidade já foi consultada, **When** o usuário realiza uma
  nova busca, **Then** o sistema obtém novos resultados sem recarregar a página.
- **AC-RF09-02.** **Given** que o usuário seleciona uma cidade diferente, **When** a nova
  consulta termina, **Then** a interface substitui os dados anteriores pelos
  dados da nova cidade sem misturar informações.
- **AC-RF09-03.** **Given** que uma nova consulta falha, **When** o erro é exibido, **Then** o
  campo e o controle de busca permanecem disponíveis para iniciar outra
  consulta.
- **AC-RF09-04.** **Given** que a cidade possui dados obsoletos com no máximo 1 hora, **When** a
  atualização falha, **Then** o sistema exibe os dados com o aviso `Dados
  possivelmente desatualizados` e o horário da última atualização.
- **AC-RF09-05.** **Given** que a cidade possui dados com mais de 1 hora, **When** a atualização
  falha, **Then** o sistema não exibe esses dados como atuais e mostra o erro
  com a ação de retry manual.

### RF10. Tratar falhas de integração

- **AC-RF10-01.** **Given** que a fonte retorna timeout, erro HTTP 5xx ou falha de conexão,
  **When** a aplicação detecta a falha, **Then** encerra o carregamento, exibe
  uma mensagem em português e oferece nova tentativa.
- **AC-RF10-02.** **Given** que a fonte retorna erro HTTP 4xx por parâmetros inválidos, **When**
  a aplicação processa a resposta, **Then** exibe uma mensagem de erro sem
  repetir automaticamente a mesma requisição.
- **AC-RF10-03.** **Given** que a fonte retorna HTTP 429, **When** a aplicação processa a
  resposta, **Then** informa que o limite de consultas foi atingido e não inicia
  retries imediatos em loop.
- **AC-RF10-04.** **Given** que a fonte retorna HTTP 200 com JSON inválido ou sem campos
  obrigatórios, **When** a resposta é processada, **Then** a aplicação trata o
  resultado como erro de integração, não exibe valores inventados e oferece
  nova tentativa.
- **AC-RF10-05.** **Given** que uma resposta de uma consulta anterior chega depois de uma nova
  consulta, **When** a aplicação recebe a resposta obsoleta, **Then** descarta
  essa resposta e preserva os dados ou o estado da consulta mais recente.
- **AC-RF10-06.** **Given** que uma resposta válida foi armazenada há até 10 minutos, **When** o
  usuário consulta a mesma cidade e unidade sem usar `Atualizar`, **Then** o
  sistema usa o cache e não chama o provedor.

## 4.1. Matriz de rastreabilidade

Cada User Story deve ser considerada coberta somente quando todos os critérios
de aceite listados estiverem implementados e testados. Os RNFs indicam as
restrições não funcionais que devem acompanhar os testes funcionais.

| User Story | Acceptance Criteria | Requisitos não funcionais relevantes |
|---|---|---|
| US01. Buscar uma cidade | AC-RF01-01, AC-RF01-02, AC-RF01-03, AC-RF01-04, AC-RF01-05 | RNF01, RNF02, RNF03, RNF06, RNF08 |
| US02. Diferenciar cidades | AC-RF02-01, AC-RF02-02, AC-RF02-03, AC-RF02-04, AC-RF03-01 | RNF01, RNF02, RNF07 |
| US03. Consultar o clima atual | AC-RF03-02, AC-RF04-01, AC-RF04-02, AC-RF04-03, AC-RF04-04 | RNF01, RNF02, RNF03, RNF06, RNF07 |
| US04. Consultar os próximos dias | AC-RF05-01, AC-RF05-02, AC-RF05-03, AC-RF05-06, AC-RF05-07 | RNF01, RNF02, RNF03, RNF07 |
| US05. Escolher unidade de temperatura | AC-RF06-01, AC-RF06-02, AC-RF06-03, AC-RF06-04 | RNF02, RNF03, RNF07 |
| US06. Retomar minha preferência | AC-RF07-01, AC-RF07-02, AC-RF07-03, AC-RF07-04 | RNF02, RNF06, RNF07 |
| US07. Recuperar-se de estados de espera e erro | AC-RF08-01, AC-RF08-02, AC-RF08-03, AC-RF08-04, AC-RF08-05, AC-RF10-01, AC-RF10-02, AC-RF10-03, AC-RF10-04 | RNF02, RNF03, RNF04, RNF06, RNF08 |
| US08. Fazer novas consultas | AC-RF09-01, AC-RF09-02, AC-RF09-03, AC-RF09-04, AC-RF09-05, AC-RF10-05, AC-RF10-06 | RNF01, RNF02, RNF03, RNF04, RNF07, RNF08 |

## 5. Non-Functional Requirements

### RNF01. Responsividade

- A interface deve funcionar a partir de 320 px de largura.
- Não deve haver rolagem horizontal, sobreposição ou perda de conteúdo em
  mobile, tablet e desktop, nos modos retrato e paisagem.
- A experiência deve priorizar o uso em dispositivos móveis.
- Os testes visuais devem cobrir, no mínimo, 320x568, 768x1024 e 1440x900 px,
  em retrato e paisagem quando aplicável.
- Com zoom de 200% em viewport de 1280 px, o conteúdo e as ações principais
  devem continuar acessíveis sem perda funcional.

### RNF02. Acessibilidade

- As funcionalidades principais devem ser operáveis por teclado.
- A interface deve usar HTML semântico, labels associados, foco visível e
  contraste adequado.
- Estados de carregamento e erro devem ser comunicados a tecnologias
  assistivas.
- O produto deve atender à WCAG 2.2 nível AA nos fluxos de busca, seleção,
  consulta, troca de unidade e retry.
- A ordem de foco deve seguir a ordem visual, nenhum controle deve ser acessível
  apenas por mouse e o foco não deve ser perdido após uma mudança de estado.
- Mensagens de carregamento, erro e resultado vazio devem ser anunciadas uma
  única vez por mudança de estado, sem interromper a digitação do usuário.

### RNF03. Desempenho

- Em produção, o carregamento inicial deve atingir o estado interativo em até
  3 segundos no percentil 75, medido pelo Lighthouse em modo mobile com rede 4G
  simulada.
- Após a resposta do provedor, o sistema deve renderizar dados ou erro em até
  500 ms no percentil 95.
- O tempo total de uma consulta deve ser limitado pelo timeout de 8 segundos
  definido em RF10.

### RNF04. Disponibilidade e resiliência

- O frontend publicado deve ter meta de disponibilidade mensal de 99,5%,
  excluindo manutenções comunicadas. A disponibilidade do provedor meteorológico
  deve ser medida separadamente e não pode ser apresentada como disponibilidade
  do frontend.
- Falhas temporárias do provedor não devem quebrar a interface nem impedir nova
  tentativa.
- Um monitor sintético deve verificar o carregamento do frontend e uma busca
  simulada a cada 5 minutos. A verificação deve abrir a aplicação, pesquisar
  uma cidade conhecida, selecionar o primeiro resultado válido e confirmar a
  exibição do estado de sucesso ou de um erro de provedor claramente tratado.
  O cálculo mensal deve excluir apenas manutenções comunicadas.

### RNF05. Compatibilidade

A aplicação deve suportar as duas versões estáveis mais recentes, na data de
cada release, de Chrome, Edge, Firefox, Safari macOS, Safari iOS e Chrome
Android. Bugs específicos de navegadores fora dessa matriz não bloqueiam o
release.

### RNF06. Segurança e privacidade

- A aplicação não deve expor credenciais ou chaves privadas no cliente.
- Não deve coletar localização precisa sem consentimento explícito.
- Deve armazenar localmente apenas a preferência de unidade necessária ao MVP.
- Não deve persistir dados de usuário em servidor.
- O cliente não deve inserir texto de busca, coordenadas ou identificadores de
  localização em logs de produto ou telemetria.
- Dependências, cabeçalhos de segurança e política de conteúdo devem ser
  revisados antes do release de produção.

### RNF07. Consistência dos dados

- A unidade selecionada deve ser aplicada de forma consistente a todos os
  valores de temperatura exibidos.
- Datas e horários devem respeitar o fuso da cidade consultada quando fornecido
  pela fonte.
- Respostas meteorológicas devem ser tratadas como dados externos e podem
  conter campos ausentes.

### RNF08. Observabilidade

Devem ser monitorados, no mínimo, contagem e taxa de erro por categoria, timeout,
latência de geocoding, latência meteorológica e disponibilidade do frontend. Os
eventos devem usar identificadores técnicos não pessoais, não registrar texto
de busca, coordenadas, IP completo ou dados de localização precisa, e devem
permitir distinguir falhas do frontend de falhas do provedor. Sentry deve ser
usado para erros e performance do frontend, Web Vitals para métricas de
experiência, e os dados devem ser retidos por 30 dias.

## 6. Edge Cases

- **Input vazio ou composto apenas por espaços:** não realizar chamada à API,
  destacar o campo e informar que o nome da cidade deve ser preenchido.
- **Texto insuficiente ou excessivamente longo:** validar o tamanho antes da
  consulta, informar o problema e não enviar uma requisição inválida ou
  desnecessariamente grande.
- **Espaços duplicados ou nas extremidades:** remover espaços nas extremidades e
  normalizar espaços duplicados antes de pesquisar.
- **Caracteres acentuados, hífens, apóstrofos ou outros alfabetos:** aceitar
  caracteres válidos de nomes de cidades e preservar o significado da busca;
  símbolos inválidos não devem quebrar a interface.
- **Cidade inexistente:** informar que a cidade não foi encontrada, não
  consultar a previsão e permitir uma nova busca.
- **Geocoding sem resultados:** exibir um estado vazio específico, como
  “Nenhuma cidade encontrada”, sem apresentar uma previsão incorreta.
- **Muitos resultados ou cidades homônimas:** mostrar cidade, região ou estado e
  país quando disponíveis, permitindo que o usuário diferencie e selecione o
  resultado correto.
- **Resultado de geocoding sem região, estado ou país:** exibir os dados
  disponíveis e usar o identificador e as coordenadas retornados, sem inventar
  informações ausentes.
- **Resposta parcial do geocoding:** permitir a seleção se houver dados
  suficientes para identificar a cidade e consultar a previsão; caso contrário,
  informar que não foi possível identificar o local.
- **Nenhuma cidade selecionada:** manter a área meteorológica em estado vazio e
  não iniciar consulta até o usuário selecionar um resultado.
- **Cancelamento, repetição ou sobreposição de buscas:** ignorar respostas
  obsoletas e garantir que uma resposta antiga não sobrescreva a cidade da
  consulta mais recente.
- **Falha de conexão ou usuário offline:** encerrar o carregamento, informar que
  não foi possível conectar ao serviço e oferecer nova tentativa.
- **Indisponibilidade da API ou resposta HTTP 5xx:** exibir mensagem
  compreensível, preservar a interface utilizável, exibir dados obsoletos apenas
  dentro da janela de 1 hora e oferecer nova tentativa.
- **Limite de requisições ou resposta HTTP 429:** informar que muitas consultas
  foram realizadas, evitar novas tentativas imediatas e permitir tentar
  novamente após um intervalo apropriado.
- **Timeout:** encerrar o estado de carregamento, informar que a resposta
  demorou e oferecer uma ação para tentar novamente.
- **Resposta HTTP 200 com JSON malformado:** tratar como erro de integração, não
  renderizar dados parcialmente interpretados e permitir nova tentativa.
- **Resposta inválida ou com campos obrigatórios ausentes:** informar que os
  dados recebidos não puderam ser processados e não exibir valores inventados.
- **Campos meteorológicos opcionais ausentes:** manter o campo visível com o
  valor `Indisponível`, sem substituir o valor por um palpite.
- **Cidade sem dados atuais:** comunicar a indisponibilidade do clima atual e
  exibir a previsão futura se ela estiver disponível.
- **Previsão com menos de cinco dias ou sem dados para algum dia:** exibir apenas
  os dias disponíveis e informar que a previsão está incompleta.
- **Dados meteorológicos incompatíveis com a cidade selecionada:** descartar a
  resposta e informar erro para impedir a exibição de dados de outra cidade.
- **Preferência de unidade ausente, inválida ou ilegível:** usar Celsius sem
  bloquear a aplicação.
- **Falha de leitura ou escrita do armazenamento local:** continuar usando a
  unidade atual durante a sessão e não exibir erro técnico desnecessário.
- **Mudança de unidade durante o carregamento:** aplicar a unidade escolhida
  quando os dados forem exibidos, sem voltar silenciosamente à unidade anterior.
- **Valores meteorológicos nulos, claramente inválidos ou fora de faixa:**
  marcar os valores inválidos como `Indisponível` e manter os demais dados
  válidos.
- **Datas ou horários próximos à mudança de dia ou ao horário de verão:** usar o
  fuso horário retornado para a cidade, e não automaticamente o fuso do
  dispositivo.
- **Nova busca após uma consulta bem-sucedida:** permitir a consulta sem
  recarregar a página e substituir os dados somente após associá-los à nova
  cidade.
- **Falha ao carregar ícone ou recurso visual:** exibir alternativa textual ou
  ícone genérico, preservando os dados meteorológicos disponíveis.
- **Viewport estreito, orientação paisagem ou rotação do dispositivo:** manter
  todo o conteúdo legível e operável, sem sobreposição ou rolagem horizontal.
- **Cidade, país ou condição climática com texto muito longo:** permitir quebra
  ou truncamento acessível sem sobreposição de elementos.
- **Falha durante a atualização de dados já exibidos:** preservar os dados
  válidos quando possível, informar que a atualização falhou e permitir nova
  tentativa.
- **Erro ou mudança de estado durante o uso por teclado:** manter foco visível,
  anunciar o carregamento ou erro a tecnologias assistivas e não prender o foco
  indevidamente.

## 7. Assumptions

- A Open-Meteo será a fonte de geocodificação e previsão do MVP e não exige
  chave de API.
- Cinco dias significa hoje mais os quatro dias seguintes.
- Celsius é a unidade padrão quando não existe preferência válida.
- A preferência de unidade é local ao dispositivo e navegador atuais.
- A interface, as mensagens, as descrições climáticas e os formatos de data
  serão apresentados em português do Brasil.
- O usuário informará a cidade manualmente; localização precisa do dispositivo
  não faz parte do MVP.
- O produto não exige conta e não sincroniza preferências entre dispositivos.
- Dados obrigatórios ausentes invalidam a seção correspondente; dados opcionais
  ausentes são exibidos como `Indisponível` e nunca são inferidos.
- A busca é global, mas a interface é exclusivamente pt-BR no MVP.
- A atualização é manual pelo botão `Atualizar`; não há atualização automática.
- O cache de geocoding e previsão dura 10 minutos. Dados obsoletos podem ser
  exibidos por até 1 hora somente durante falha do provedor.
- A última previsão válida não será exibida após ultrapassar 1 hora.
- O mapa de códigos WMO é fixo e versionado; códigos desconhecidos resultam em
  condição `Indisponível` sem invalidar os demais dados.

## 8. Risks

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Indisponibilidade ou instabilidade da Open-Meteo | Média | Alto | Definir timeout, tratar erros, oferecer nova tentativa controlada e monitorar falhas. |
| Limites de uso ou custos inesperados do provedor | Baixa | Alto | Aplicar debounce, evitar chamadas duplicadas, usar cache apropriado e monitorar consumo. |
| Resultados ambíguos para cidades homônimas | Alta | Alto | Exibir região ou estado e país e usar os identificadores e coordenadas retornados. |
| Dados incompletos ou desatualizados | Média | Alto | Validar respostas, tratar campos opcionais e mostrar o horário da última atualização. |
| Layout inadequado em telas pequenas | Média | Alto | Desenvolver mobile-first e testar larguras, orientações e navegadores prioritários. |
| Falhas de acessibilidade | Média | Alto | Usar semântica, teclado, contraste, foco visível e testes automatizados. |
| Conversão inconsistente entre Celsius e Fahrenheit | Baixa | Médio | Centralizar a regra de unidade, validar valores permitidos e testar ambas as unidades. |
| Exposição acidental de dados sensíveis | Baixa | Alto | Não usar segredos no frontend, limitar dados armazenados e revisar telemetria e dependências. |
| Expectativa por recursos fora do MVP | Alta | Médio | Documentar o escopo e os itens explicitamente fora da primeira versão. |

## 9. Out of Scope

- Autenticação, criação de contas e gerenciamento de perfis.
- Favoritos sincronizados ou persistidos em servidor.
- Qualquer persistência de dados de usuário em servidor.
- Notificações, alertas meteorológicos e avisos push.
- Mapas, radar meteorológico e visualizações geográficas avançadas.
- Funcionamento offline completo.
- Consulta automática baseada na localização precisa do dispositivo.
- Sincronização da unidade ou de qualquer preferência entre dispositivos.
- Atualização automática em segundo plano.
- Histórico de buscas, compartilhamento de previsões e links permanentes.
- Tradução da interface para outros idiomas.
- Métricas de negócio e funil de conversão no MVP.

## 10. Open Questions

Não há perguntas de produto bloqueadoras para o desenvolvimento do MVP. As
decisões de arquitetura, implementação e implantação devem ser detalhadas no
plano técnico sem alterar os comportamentos definidos nesta especificação.
