# Backlog de Tarefas — Weather App

Este documento revisa o backlog inicial e reforça a objetividade dos critérios de aceite de cada tarefa. O foco é manter cada item pequeno, verificável e rastreável aos requisitos da spec.

## Tarefas reavaliadas e quebradas

As tarefas que originalmente misturavam múltiplas camadas foram fragmentadas em subtarefas menores: `T-03`, `T-05`, `T-07`, `T-09`, `T-10`, `T-11`, `T-12`, `T-13`, `T-14`, `T-15`, `T-16`, `T-17`, `T-18`, `T-19` e `T-20`.

---

## Entrega 1 — Base do projeto e contratos de domínio

### T-01 — Configurar a base do app e a tooling do projeto
- **Descrição:** Inicializar a estrutura React + Vite + TypeScript + Tailwind e garantir que a aplicação rode em desenvolvimento com build e lint estáveis.
- **Critérios de aceite:**
  1. `pnpm install` conclui com exit code 0.
  2. `pnpm build` conclui com exit code 0 e gera a pasta `dist`.
  3. `pnpm lint` conclui com exit code 0 ou apenas avisos não bloqueantes.
  4. A aplicação renderiza um shell inicial sem erros no navegador e o texto principal está em português.
  5. O projeto inclui os arquivos de configuração base de `Vite`, `TypeScript`, `Tailwind` e `Biome`/`package.json`.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `package.json`, `vite.config.ts`, `tailwind.config.js`, `src/App.tsx`, `src/main.tsx`, `index.html`.
- **Tipo:** Infra
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF01–RF10 (infraestrutura base)

### T-02 — Definir tipos do domínio e utilidades de temperatura/WMO
- **Descrição:** Criar os tipos compartilhados do domínio, as funções de conversão de temperatura e o mapeamento de WMO para texto e ícone em pt-BR.
- **Critérios de aceite:**
  1. Os tipos `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `ApiError` existem e são exportados dos módulos de `types`.
  2. A função de conversão usa a fórmula `F = C * 9 / 5 + 32` e `C = (F - 32) * 5 / 9` com precisão aceitável para 1 casa decimal.
  3. O mapeamento WMO cobre todos os códigos listados no requisito e retorna `Indisponível` para código desconhecido.
  4. Os campos obrigatórios e opcionais do domínio ficam separados e respeitam a definição de produto.
  5. Os testes unitários da utilidade de temperatura e do mapeamento WMO passam em casos positivos e negativos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`, `src/types/api.ts`, `src/lib/temperature.ts`, `src/lib/wmoMapping.ts`, `src/lib/validation.ts`.
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF04, RF05, RF06, RF10; definições do produto de campos obrigatórios/opcionais

### T-03 — Implementar cliente HTTP base para integrações externas
- **Descrição:** Criar um cliente HTTP reutilizável, com timeout, `AbortController`, parse e classificação de erros.
- **Critérios de aceite:**
  1. A função de request usa `AbortController` e aborta quando o componente ou hook for desmontado.
  2. O timeout é definido em 8 segundos para requisições de geocoding e forecast.
  3. Erros de rede, timeout, HTTP 429, HTTP 4xx e 5xx são convertidos em objetos `ApiError` com `type`, `message`, `recoverable` e `canRetry`.
  4. O cliente rejeita payloads inválidos em JSON e retorna erro estruturado em vez de quebrar a aplicação.
  5. O mesmo cliente é utilizado por `geocodingService` e `weatherService` sem duplicação de lógica.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/apiClient.ts`.
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** P
- **Rastreio:** RF01, RF05, RF10; AC-RF10-01, AC-RF10-02, AC-RF10-03 (no escopo do MVP)

### T-04 — Implementar serviço de geocoding e normalização do payload
- **Descrição:** Encapsular a busca de cidades via Open-Meteo e transformar a resposta em objetos `City` alinhados ao contrato interno.
- **Critérios de aceite:**
  1. A chamada usa `name`, `language=pt`, `count=10` e `format=json`.
  2. A resposta é convertida em até 10 cidades, ordenadas pela relevância da API.
  3. Cada cidade inclui `id`, `name`, `country`, `admin1`, `latitude` e `longitude` quando disponíveis.
  4. O serviço rejeita/retorna erro quando `latitude` ou `longitude` não forem válidos para a seleção.
  5. Erros de integração são propagados como `ApiError`, sem quebrar o fluxo da UI.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF01, RF02, RF03; AC-RF01-01, AC-RF02-01, AC-RF02-02, AC-RF02-03

---

## Entrega 2 — Busca, resultados e seleção da cidade

### T-05 — Validar entrada e preparar a busca do usuário
- **Descrição:** Criar a lógica de normalização e validação do texto antes de disparar a requisição de geocoding.
- **Critérios de aceite:**
  1. A função de normalização remove espaços nas bordas e consolida espaços consecutivos em um único espaço.
  2. Quando o texto normalizado estiver vazio, a validação retorna erro com mensagem “Informe o nome da cidade”.
  3. Quando o texto tiver mais de 100 caracteres após a normalização, a validação retorna erro com a mensagem do limite permitido.
  4. A entrada aceita caracteres Unicode e acentos sem falhar na validação.
  5. A string normalizada é usada como parâmetro `name` na chamada ao geocoding.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/normalizeSearchText.ts`, `src/lib/validation.ts`.
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** P
- **Rastreio:** RF01; AC-RF01-01, AC-RF01-02, AC-RF01-03, AC-RF01-04, AC-RF01-05

### T-06 — Construir formulário de busca com feedback de carregamento
- **Descrição:** Implementar o input, botão de busca e estados visuais de validação e carregamento.
- **Critérios de aceite:**
  1. Ao clicar no botão ou pressionar `Enter`, a busca é disparada somente quando o texto passa na validação.
  2. Enquanto a busca está em andamento, o botão recebe estado de carregamento e o campo fica desabilitado.
  3. Mensagens de validação aparecem ao lado do campo e são acessíveis por leitores de tela.
  4. Uma mesma consulta em andamento não dispara requisições duplicadas.
  5. O formulário mantém a aplicação em português no texto da interface.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF01, RF08; AC-RF01-01, AC-RF01-02, AC-RF01-05

### T-07 — Implementar hook de pesquisa por cidade
- **Descrição:** Conectar a busca do usuário ao serviço de geocoding e controlar estados de carregamento, vazio e erro.
- **Critérios de aceite:**
  1. O hook expõe `results`, `loading`, `error` e `empty` e atualiza cada um conforme o ciclo da requisição.
  2. Quando a API retornar 0 cidades, o hook emite `empty=true` e a UI mostra mensagem de ausência de resultados.
  3. O hook truncará a lista em 10 itens e nunca devolverá mais que 10 resultados.
  4. O hook ignora requisições duplicadas para a mesma busca quando outra já está em andamento.
  5. O hook só retorna resultados que possuem `id`, `latitude` e `longitude` válidos.
- **Dependências:** T-04, T-06.
- **Arquivos prováveis:** `src/hooks/useCitySearch.ts`.
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF01, RF02, RF08; AC-RF02-01, AC-RF02-03, AC-RF01-05

### T-08 — Renderizar lista de resultados e permitir seleção segura
- **Descrição:** Exibir a lista de cidades e permitir seleção somente quando a cidade tiver coordenadas válidas.
- **Critérios de aceite:**
  1. Cada linha da lista mostra nome da cidade, região/estado e país quando disponíveis.
  2. Quando `country` ou `admin1` não existirem, a interface exibe `Indisponível` e não inventa valores.
  3. A seleção só é habilitada quando `latitude` e `longitude` forem finitos e válidos.
  4. Ao selecionar, a cidade mantem o `id` original da API para a consulta meteorológica.
  5. A lista é navegável por teclado via foco e interações nativas de botão/lista.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/components/SearchResults.tsx`, `src/app/App.tsx`.
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF02, RF03, RF08, US02; AC-RF02-01, AC-RF02-02, AC-RF02-03

---

## Entrega 3 — Dados meteorológicos e previsão

### T-09 — Implementar serviço de forecast e normalização da resposta
- **Descrição:** Encapsular a consulta meteorológica da cidade selecionada e transformar a resposta da API em um contrato interno pronto para renderização.
- **Critérios de aceite:**
  1. A requisição inclui latitude, longitude, `current`, `daily`, `timezone=auto`, `forecast_days=5` e a unidade ativa.
  2. O serviço valida campos obrigatórios antes de construir `CurrentWeather` e `ForecastDay`.
  3. O campo `weatherCode` é mapeado para texto em pt-BR e ícone semântico suportado pela tabela do WMO.
  4. Quando `weatherCode` for desconhecido, o serviço preserva os dados restantes e retorna texto/ícone `Indisponível`.
  5. O payload interno mantém valores opcionais e usa `Indisponível` quando ausentes.
- **Dependências:** T-03, T-04, T-08.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF04, RF05, RF10; definição do WMO e campos obrigatórios/opcionais do produto

### T-10 — Implementar hook de clima e estado de refresh/erro do forecast
- **Descrição:** Gerenciar a consulta meteorológica, cache em memória, refresh manual e stale data.
- **Critérios de aceite:**
  1. O hook dispara a busca do forecast quando a cidade selecionada mudar.
  2. A mesma cidade e unidade é cacheada por até 10 minutos pela chave `weather:${city.id}:${unit}`.
  3. O botão `Atualizar` ignora o cache válido e força nova requisição.
  4. O hook expõe `loading`, `success`, `error`, `empty` e `stale` quando existir dado antigo e válido.
  5. Dados meteorológicos com mais de 1 hora não são exibidos como previsão atual.
- **Dependências:** T-09.
- **Arquivos prováveis:** `src/hooks/useWeatherQuery.ts`.
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF05, RF09, RF10; AC-RF10-01, AC-RF10-02, definição de cache e stale data

### T-11 — Exibir clima atual e dados principais da cidade
- **Descrição:** Criar o componente que apresenta o clima atual e os dados obrigatórios para o estado de sucesso.
- **Critérios de aceite:**
  1. O bloco renderiza cidade, país, temperatura atual, condição climática, sensação térmica, umidade, velocidade do vento e horário da última atualização.
  2. Se qualquer campo opcional estiver ausente, o componente exibe `Indisponível` e não inventa dados.
  3. O campo `temperature` e `weatherLabel` são obrigatórios para renderizar a seção e não podem ficar vazios.
  4. A unidade atual (`celsius` ou `fahrenheit`) é aplicada a todos os valores de temperatura exibidos.
  5. O componente usa rótulos semânticos e texto em português.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/components/WeatherCurrent.tsx`.
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF04, RF06, RF08; AC-RF04-01, AC-RF06-01

### T-12 — Exibir previsão de cinco dias em ordem cronológica
- **Descrição:** Implementar a listagem diária da previsão para hoje e os próximos quatro dias.
- **Critérios de aceite:**
  1. A previsão renderiza um conjunto com 5 dias quando a API retornar 5 registros.
  2. Cada item exibe data, condição climática, temperatura mínima e máxima.
  3. Ícone e probabilidade de precipitação aparecem quando a API os retornar.
  4. Quando a fonte devolver menos de 5 dias, a UI exibe os dias disponíveis e uma mensagem de previsão incompleta.
  5. A ordem cronológica é preservada por `date` e a interface não reordena os itens.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/components/WeatherForecast.tsx`.
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF05; AC-RF05-01, AC-RF05-02, AC-RF05-03

---

## Entrega 4 — Unidade, cache e feedback visual

### T-13 — Implementar toggle de unidade e persistência no navegador
- **Descrição:** Adicionar o controle de unidade e persistir a preferência em `localStorage`.
- **Critérios de aceite:**
  1. O usuário consegue alternar entre `celsius` e `fahrenheit` via interface.
  2. A unidade ativa é aplicada ao clima atual, sensação térmica e previsão.
  3. O valor persistido em `localStorage` usa a chave `weather-app:unit` e aceita apenas `celsius` e `fahrenheit`.
  4. Se a chave estiver ausente ou inválida, a app usa Celsius por padrão.
  5. A mesma preferência permanece após recarregar a página no mesmo navegador.
- **Dependências:** T-02, T-10.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`, `src/hooks/usePersistentUnit.ts`.
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF06, RF07; US05, US06

### T-14 — Tratar dado stale, erro de integração e mensagem de retry manual
- **Descrição:** Lidar com falhas recuperáveis e com dados obsoletos exibidos com aviso explícito.
- **Critérios de aceite:**
  1. Falhas de rede, timeout e respostas HTTP 5xx exibem mensagem em português e habilitam retry manual.
  2. Respostas HTTP 4xx não disparam retry automático e mostram mensagem informando que o usuário deve corrigir a entrada.
  3. Quando houver dado obsoleto com até 1 hora, o componente mostra `Dados possivelmente desatualizados` e a hora da última atualização.
  4. Dados com mais de 1 hora não são exibidos como previsão atual.
  5. O fluxo usa `AbortController` para cancelar chamadas antigas durante retry ou troca de cidade.
- **Dependências:** T-09, T-10.
- **Arquivos prováveis:** `src/lib/validation.ts`, `src/services/weatherService.ts`, `src/hooks/useWeatherQuery.ts`.
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF08, RF09, RF10; AC-RF10-01, AC-RF10-02, AC-RF10-03

### T-15 — Construir mensagens de estado global e rodapé de atribuição
- **Descrição:** Garantir feedback visual para carregamento, vazio, erro e ausência de dados, além do rodapé com a origem dos dados.
- **Critérios de aceite:**
  1. A interface exibe mensagem para estado inicial, carregamento, vazio, erro de validação, erro de busca e erro meteorológico.
  2. Cada erro informa se o usuário pode corrigir a entrada ou tentar novamente manualmente.
  3. O rodapé apresenta `Dados meteorológicos: Open-Meteo.com` quando existir dados meteorológicos na tela.
  4. A mensagem de status é legível por teclado e por tecnologias assistivas.
  5. A UI usa texto em português em todos os estados de falha e vazio.
- **Dependências:** T-06, T-08, T-11, T-12, T-14.
- **Arquivos prováveis:** `src/components/StatusMessage.tsx`, `src/components/FooterAttribution.tsx`, `src/app/App.tsx`.
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** M
- **Rastreio:** RF08, RF09, RF10; US07

### T-15-A — Tratar estado de cidade ainda não selecionada e ausência de timezone
- **Descrição:** Criar um estado explícito para “cidade não selecionada” e garantir que a UI lide com respostas sem `timezone` sem recalcular no fuso local.
- **Critérios de aceite:**
  1. Quando a aplicação inicia sem cidade selecionada, a tela mostra mensagem clara de que o usuário deve buscar e escolher uma cidade.
  2. A UI não exibe clima atual nem previsão antes da seleção da cidade.
  3. Quando a resposta do forecast não inclui `timezone`, a aplicação usa as datas diárias retornadas sem converter para o fuso do navegador.
  4. Quando `timezone` estiver ausente, o campo de horário de atualização é exibido como `Indisponível`.
  5. O estado de “cidade não selecionada” é acessível por leitores de tela e atende ao requisito RF08.
- **Dependências:** T-08, T-10, T-15.
- **Arquivos prováveis:** `src/app/App.tsx`, `src/components/WeatherCurrent.tsx`, `src/components/WeatherForecast.tsx`, `src/lib/dateTime.ts`.
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** P
- **Rastreio:** RF05, RF08; AC-RF05-03, AC-RF08-01

---

## Entrega 5 — Cobertura de testes e garantia de qualidade

### T-16 — Implementar testes unitários de validação e conversão
- **Descrição:** Validar utilidades puras de busca, conversão e regras de integridade dos dados meteorológicos.
- **Critérios de aceite:**
  1. Há testes unitários para `normalizeSearchText` cobrindo entrada vazia, espaços extras e acentos.
  2. Há testes para rejeição de texto com mais de 100 caracteres após normalização.
  3. Há testes que validam conversão `C ↔ F` com valores inteiros e decimais.
  4. Há testes para campos ausentes e para a regra de fallback `Indisponível`.
  5. Os testes passam com execução local via `pnpm test` em modo unitário.
- **Dependências:** T-02, T-05.
- **Arquivos prováveis:** `tests/unit/validation.test.ts`, `tests/unit/temperature.test.ts`.
- **Tipo:** Test
- **Prioridade:** P1
- **Tamanho:** P
- **Rastreio:** RF01, RF06, RF08; AC-RF01-02, AC-RF01-03, AC-RF06-01

### T-17 — Implementar testes unitários dedicados à conversão de unidade
- **Descrição:** Cobrir exatamente a lógica de conversão de Celsius/Fahrenheit, incluindo bordas e formatação de exibição.
- **Critérios de aceite:**
  1. Há testes para `0°C -> 32°F`, `100°C -> 212°F`, `32°F -> 0°C` e `68°F -> 20°C`.
  2. Há testes para valores decimais como `21°C -> 69.8°F` e `50°F -> 10°C`.
  3. Há testes para arredondamento/formatting, garantindo que valores inteiros permaneçam inteiros e decimais tenham no máximo uma casa decimal.
  4. A função de conversão rejeita ou trata valores `NaN`, `null` e indefinidos de forma segura.
  5. A cobertura desta tarefa fica organizada em `tests/unit/unit-conversion.test.ts`.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/unit/unit-conversion.test.ts`, `src/lib/temperature.ts`.
- **Tipo:** Test
- **Prioridade:** P1
- **Tamanho:** P
- **Rastreio:** RF06; AC-RF06-01, AC-RF06-02

### T-18 — Implementar testes de service com mock de `fetch`
- **Descrição:** Validar o comportamento dos serviços de geocoding e forecast usando `fetch` mockado para responder a payloads reais e erros de rede.
- **Critérios de aceite:**
  1. O teste mocka `global.fetch` para responder com payloads válidos de geocoding e forecast.
  2. O serviço de geocoding transforma a resposta em objetos `City` corretamente e respeita `language=pt`, `count=10` e `format=json`.
  3. O serviço de forecast valida campos obrigatórios, envia `latitude`, `longitude`, `current`, `daily`, `timezone=auto`, `forecast_days=5` e a unidade ativa.
  4. Há testes para timeout, HTTP 429 e erro de rede, validando que `ApiError` retornado contém `type`, `message`, `recoverable` e `canRetry`.
  5. A suíte fica em `tests/unit/services.test.ts` ou equivalente e usa `vi.fn()`/`fetch` mockado sem depender da API real.
- **Dependências:** T-03, T-04, T-09.
- **Arquivos prováveis:** `tests/unit/services.test.ts`, `src/services/geocodingService.ts`, `src/services/weatherService.ts`.
- **Tipo:** Test
- **Prioridade:** P1
- **Tamanho:** M
- **Rastreio:** RF01, RF02, RF04, RF05, RF10; AC-RF01-01, AC-RF10-01, AC-RF10-02

### T-19 — Implementar testes de componentes nos estados loading, erro e vazio
- **Descrição:** Garantir que os componentes da UI exibem corretamente os estados mais críticos sem depender da API real.
- **Critérios de aceite:**
  1. O componente de busca renderiza estado de carregamento com botão desabilitado e mensagem apropriada.
  2. O componente de resultados renderiza mensagem de vazio quando a lista vier vazia.
  3. O componente de erro/feedback exibe a mensagem de erro de validação ou falha de busca em português.
  4. Os testes verificam `loading`, `error` e `empty` com `@testing-library/react` e `screen.getByRole`/`queryByRole`.
  5. A suíte fica em `tests/unit/components-state.test.tsx` e cobre os três estados sem rasurar o comportamento real.
- **Dependências:** T-06, T-08, T-15.
- **Arquivos prováveis:** `tests/unit/components-state.test.tsx`, `src/components/SearchForm.tsx`, `src/components/SearchResults.tsx`, `src/components/StatusMessage.tsx`.
- **Tipo:** Test
- **Prioridade:** P1
- **Tamanho:** M
- **Rastreio:** RF01, RF02, RF08; AC-RF01-02, AC-RF02-02, AC-RF08-01

### T-20 — Implementar testes E2E do fluxo principal
- **Descrição:** Validar o caminho principal do usuário em browser real, incluindo a experiência em viewport mobile.
- **Critérios de aceite:**
  1. O cenário E2E percorre: abrir app → buscar uma cidade → selecionar um resultado → visualizar clima atual → ver previsão → alterar unidade.
  2. O teste executa em mobile com viewport configurada, por exemplo `390x844`, e o layout permanece funcional.
  3. A navegação ocorre sem reload manual e a UI permanece em português.
  4. O teste verifica pelo menos três pontos de UI importantes: busca, clima atual e previsão.
  5. O arquivo fica em `tests/e2e/weather-flow.spec.ts` e usa Playwright com configuração de viewport móvel.
- **Dependências:** T-15, T-19.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test
- **Prioridade:** P1
- **Tamanho:** M
- **Rastreio:** RF01–RF10; US01–US08

### T-21 — Implementar testes E2E de erro, vazio e retry manual
- **Descrição:** Cobrir os cenários de falha e ausência de resultados do fluxo principal end-to-end.
- **Critérios de aceite:**
  1. Uma busca vazia ou sem resultados mostra o estado de vazio ou erro em português.
  2. Uma falha de integration mockada mostra feedback de retry manual e mantém a interface acessível.
  3. O usuário consegue tentar novamente sem recarregar a página.
  4. O teste verifica o comportamento em mobile e desktop, conforme a configuração do projeto.
  5. O cenário fica em `tests/e2e/error-states.spec.ts`.
- **Dependências:** T-15, T-19.
- **Arquivos prováveis:** `tests/e2e/error-states.spec.ts`.
- **Tipo:** Test
- **Prioridade:** P1
- **Tamanho:** M
- **Rastreio:** RF01, RF08, RF09, RF10; AC-RF01-02, AC-RF10-01, AC-RF10-02

### T-22 — Realizar revisão final de robustez e regressões
- **Descrição:** Executar lint, build e testes para validar que o app atende à spec sem regressões no fluxo principal.
- **Critérios de aceite:**
  1. `pnpm lint` executa com exit code 0.
  2. `pnpm build` executa com exit code 0 e gera build sem erros.
  3. `pnpm test` executa unidade + E2E com todos os testes passando.
  4. Nenhuma regressão é detectada em busca, seleção, previsão, unidade e mensagens de erro.
  5. O código final está alinhado com a estrutura esperada da especificação e do plano técnico.
- **Dependências:** T-20, T-21.
- **Arquivos prováveis:** `src/**`, `tests/**`, configuração do projeto.
- **Tipo:** Infra
- **Prioridade:** P2
- **Tamanho:** P
- **Rastreio:** RF01–RF10; garantia final de conformidade com spec e plano

---

## Tabela de rastreio: requisito funcional x tarefas

| Requisito funcional | Tarefas que implementam | Status |
|---|---|---|
| RF01. Buscar cidades | T-05, T-06, T-07, T-18, T-19, T-20, T-21 | Coberto |
| RF02. Exibir resultados de busca | T-04, T-07, T-08, T-18, T-19, T-20 | Coberto |
| RF03. Selecionar cidade | T-08, T-20 | Coberto |
| RF04. Exibir clima atual | T-09, T-10, T-11, T-18, T-19, T-20 | Coberto |
| RF05. Exibir previsão de cinco dias | T-09, T-10, T-12, T-15-A, T-18, T-20 | Coberto |
| RF06. Alternar unidade de temperatura | T-02, T-10, T-13, T-17, T-20 | Coberto |
| RF07. Persistir unidade no navegador | T-13 | Coberto |
| RF08. Informar estados da aplicação | T-06, T-07, T-11, T-12, T-15, T-15-A, T-19, T-21 | Coberto |
| RF09. Repetir consultas | T-10, T-14, T-15, T-21 | Coberto |
| RF10. Tratar falhas de integração | T-03, T-09, T-10, T-14, T-18, T-21 | Coberto |

> Observação: não há lacuna funcional crítica; o ajuste realizado adicionou a cobertura explícita para o estado inicial sem cidade selecionada e para a ausência de `timezone` em RF05/RF08.

## Sequência sugerida de entrega em fatias verticais

A ideia é entregar valor visível cedo, sem bloquear o restante do projeto. A sequência abaixo prioriza fluxo principal completo em camadas pequenas e úteis:

### Fatia 1 — Buscas e resultados básicos
- T-01, T-02, T-03, T-04
- T-05, T-06, T-07, T-08
- Objetivo: o usuário consegue pesquisar e selecionar uma cidade e ver resultados visíveis.
- Valor visível: UI funcional de busca com lista de cidades.

### Fatia 2 — Clima atual e previsão mínima
- T-09, T-10, T-11, T-12
- T-15-A
- Objetivo: após escolher cidade, o app mostra clima atual e previsão do dia/semana.
- Valor visível: a funcionalidade principal já está funcionando em uma tela real.

### Fatia 3 — Unidade e feedback do usuário
- T-13, T-14, T-15
- Objetivo: alternar entre Celsius/Fahrenheit, tratar erros e exibir estados visuais.
- Valor visível: UX de uso real, com resposta do sistema e preservação da preferência.

### Fatia 4 — Testes de regressão e qualidade
- T-16, T-17, T-18, T-19
- T-20, T-21
- Objetivo: garantir confiabilidade do fluxo principal e dos limites de negócio.
- Valor visível: redução de regressões e confiança para continuar evoluindo.

### Fatia 5 — Hardening final
- T-22
- Objetivo: validação final de lint/build/test antes de considerar o MVP pronto.
- Valor visível: garantia de qualidade e readiness para entrega.

## Classificação por prioridade e tamanho

- P0: tarefas críticas para o fluxo principal e MVP funcional — T-01 a T-15-A.
- P1: tarefas de cobertura e validação do comportamento — T-16 a T-21.
- P2: revisão final de robustez e qualidade — T-22.

- P (pequeno): tarefas com escopo de utilitário ou ajuste local — T-03, T-05, T-15-A, T-16, T-17, T-22.
- M (médio): tarefas de integração, UI ou módulos de estado — T-01, T-02, T-04, T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-13, T-14, T-15, T-18, T-19, T-20, T-21.
- G (grande): não há tarefa G no backlog atual; o projeto foi fragmentado para manter o trabalho em blocos menores e mais entregáveis.

## Ordenação por dependência

1. T-01 → T-02 → T-03 → T-04
2. T-05 → T-06 → T-07 → T-08
3. T-09 → T-10 → T-11 → T-12
4. T-13 → T-14 → T-15 → T-15-A
5. T-16 → T-17 → T-18 → T-19 → T-20 → T-21 → T-22

Essa ordem reduz acoplamento, separa UI de dados e mantém cada tarefa como um bloco testável e rastreável para a spec.
