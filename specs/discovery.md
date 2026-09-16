# Discovery: Weather App

## Contexto

A empresa solicitou uma aplicação web de previsão do tempo. O MVP deve permitir que usuários busquem cidades e consultem o clima atual e a previsão de cinco dias em uma interface responsiva, com foco em dispositivos móveis.

O produto será uma aplicação sem autenticação e sem persistência de dados em servidor. A interface será disponibilizada em português do Brasil.

## Objetivo do Produto

Permitir que uma pessoa consulte rapidamente as condições meteorológicas de uma cidade e use a previsão para planejar deslocamentos, viagens e atividades dos próximos dias.

## Escopo do MVP

- Busca de cidades por nome.
- Seleção de uma cidade entre os resultados encontrados.
- Exibição do clima atual.
- Exibição da previsão diária de cinco dias: hoje e os quatro dias seguintes.
- Alternância entre Celsius e Fahrenheit.
- Persistência da unidade escolhida no `localStorage` do navegador.
- Interface responsiva para mobile, tablet e desktop.
- Estados explícitos de carregamento, vazio, erro e sucesso.

Ficam fora do escopo inicial: autenticação, favoritos sincronizados, persistência em servidor, notificações, alertas meteorológicos e funcionamento offline completo.

## Personas

### Marina, profissional em deslocamento

- **Objetivo:** saber rapidamente se precisa levar guarda-chuva ou adaptar o trajeto.
- **Contexto:** usa principalmente o celular, durante a manhã e entre deslocamentos, com pouco tempo e conexão móvel.
- **Métrica de sucesso:** encontrar a cidade e compreender a previsão em até 30 segundos, sem repetir a busca.

### Rafael, planejador de atividades

- **Objetivo:** verificar as condições dos próximos dias antes de planejar passeios, viagens ou atividades ao ar livre.
- **Contexto:** usa desktop ou tablet, geralmente à noite, com mais tempo para analisar a previsão de cinco dias.
- **Métrica de sucesso:** consultar a previsão completa e tomar uma decisão sem precisar recorrer a outra fonte.

### Aisha, usuária internacional

- **Objetivo:** consultar o clima de cidades em diferentes países usando uma unidade familiar.
- **Contexto:** usa principalmente o celular durante viagens e pode pesquisar cidades com nomes semelhantes.
- **Métrica de sucesso:** identificar corretamente a cidade, visualizar os dados na unidade escolhida e interpretar a previsão sem confusão.

## Requisitos Funcionais

### RF01. Buscar cidades

O sistema deve permitir a busca de cidades por nome, incluindo suporte a caracteres acentuados quando aplicável.

### RF02. Exibir resultados de busca

O sistema deve exibir resultados com contexto suficiente para diferenciar cidades homônimas, incluindo cidade, região/estado e país quando disponíveis.

### RF03. Selecionar cidade

O usuário deve poder selecionar uma cidade nos resultados para consultar seus dados meteorológicos.

### RF04. Exibir clima atual

Para a cidade selecionada, o sistema deve exibir, quando fornecidos pela fonte de dados:

- nome da cidade e país;
- temperatura atual;
- condição climática e ícone representativo;
- sensação térmica;
- umidade;
- velocidade do vento;
- horário da última atualização.

Campos ausentes devem ser omitidos ou apresentados com estado explícito, sem inventar valores.

### RF05. Exibir previsão de cinco dias

O sistema deve exibir a previsão diária de hoje e dos quatro dias seguintes. Cada dia deve apresentar, quando disponível, data, condição climática, temperatura mínima e máxima, ícone e probabilidade de precipitação.

### RF06. Alternar unidade de temperatura

O usuário deve poder alternar entre Celsius e Fahrenheit. A unidade selecionada deve ser aplicada ao clima atual e à previsão.

### RF07. Persistir unidade no navegador

O sistema deve salvar a preferência de unidade no `localStorage` usando um valor validado (`celsius` ou `fahrenheit`). Quando não houver preferência válida, deve usar Celsius.

A preferência é local ao dispositivo e navegador atuais. Não haverá sincronização entre dispositivos.

### RF08. Informar estados da aplicação

O sistema deve informar visualmente os estados de carregamento, ausência de resultados, erro de busca, erro da fonte meteorológica e ausência de uma cidade selecionada.

### RF09. Repetir consultas

O usuário deve poder realizar uma nova busca sem recarregar a página.

### RF10. Tratar falhas de integração

Em caso de falha de conexão, indisponibilidade da API ou resposta inválida, o sistema deve exibir uma mensagem compreensível e oferecer uma nova tentativa quando aplicável.

## Requisitos Não-Funcionais

### RNF01. Responsividade

A interface deve funcionar em larguras a partir de 320 px, sem rolagem horizontal, sobreposição ou perda de conteúdo. Deve suportar mobile, tablet e desktop em orientações retrato e paisagem.

### RNF02. Acessibilidade

As funcionalidades principais devem ser operáveis por teclado, possuir HTML semântico, labels associados e estados de carregamento e erro comunicados a tecnologias assistivas. O objetivo é atender à WCAG 2.2 nível AA.

### RNF03. Desempenho

O conteúdo inicial deve carregar em até 3 segundos em uma conexão 4G em ambiente de produção. Após a seleção de uma cidade, o sistema deve apresentar dados ou erro em até 2 segundos, desconsiderando indisponibilidade do provedor externo.

### RNF04. Disponibilidade e resiliência

A aplicação deve ter meta de disponibilidade mensal de 99,5%, excluindo manutenções comunicadas. Falhas temporárias do provedor não devem quebrar a interface nem impedir uma nova tentativa.

### RNF05. Compatibilidade

A aplicação deve suportar as versões atuais dos principais navegadores modernos em desktop e dispositivos móveis, conforme a matriz de suporte definida no plano técnico.

### RNF06. Segurança e privacidade

A aplicação não deve expor credenciais ou chaves privadas no cliente. Não deve coletar localização precisa sem consentimento explícito e deve armazenar apenas a preferência de unidade localmente.

### RNF07. Consistência

A unidade selecionada deve ser aplicada de forma consistente em todos os valores de temperatura exibidos. Datas e horários devem respeitar o fuso da cidade consultada, quando fornecido pela API.

### RNF08. Observabilidade

Falhas de integração, latência, erros de busca e indisponibilidade devem ser monitoráveis sem registrar dados pessoais desnecessários.

## Fonte de Dados

A aplicação utilizará a Open-Meteo para geocodificação e dados meteorológicos, sem API key.

A integração deve ficar isolada em serviços próprios para permitir validação das respostas, tratamento de campos ausentes e eventual substituição do provedor.

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Indisponibilidade ou instabilidade da Open-Meteo | Média | Alto | Definir timeout, tratamento de erros, nova tentativa controlada e monitoramento. |
| Limites de uso ou custos inesperados do provedor | Baixa | Alto | Aplicar debounce na busca, evitar chamadas duplicadas, usar cache apropriado e monitorar consumo. |
| Resultados ambíguos para cidades homônimas | Alta | Alto | Exibir região/estado e país, além de usar identificadores e coordenadas retornados pela geocodificação. |
| Dados incompletos ou desatualizados | Média | Alto | Validar respostas, tratar campos opcionais e exibir horário da última atualização. |
| Layout inadequado em telas pequenas | Média | Alto | Desenvolver mobile-first e testar larguras, orientações e navegadores prioritários. |
| Falhas de acessibilidade | Média | Alto | Usar semântica correta, teclado, contraste, foco visível e testes automatizados. |
| Conversão inconsistente entre Celsius e Fahrenheit | Baixa | Médio | Centralizar a regra de unidade, validar valores permitidos e cobrir ambas as unidades em testes. |
| Exposição acidental de dados sensíveis | Baixa | Alto | Não usar segredos no frontend, limitar dados armazenados e revisar telemetria e dependências. |
| Expectativa por recursos fora do MVP | Alta | Médio | Documentar claramente o escopo e os itens explicitamente fora da primeira versão. |

## Decisões

### D01. Fonte de dados: Open-Meteo

A Open-Meteo será usada para geocodificação e previsão meteorológica, sem API key.

**Justificativa:** reduz a complexidade inicial e elimina o gerenciamento de credenciais no MVP.

**Resolve:** escolha do provedor, necessidade de API key e fonte de dados de localização/clima.

### D02. Definição de cinco dias

“Cinco dias” significa hoje mais os quatro dias seguintes.

**Justificativa:** cria uma interpretação objetiva para desenvolvimento, testes e critérios de aceite.

**Resolve:** ambiguidade sobre incluir ou não o dia atual.

### D03. Unidade padrão: Celsius

Celsius será a unidade inicial quando não existir uma preferência válida.

**Justificativa:** é a convenção adequada ao público inicial de pt-BR e mantém um comportamento previsível.

**Resolve:** unidade padrão da primeira visita.

### D04. Persistência local da unidade

A preferência de unidade será persistida no `localStorage` do navegador. Valores inválidos ou ausentes resultam em Celsius.

**Justificativa:** preserva a preferência entre acessos no mesmo dispositivo sem exigir conta, backend ou armazenamento de servidor.

**Resolve:** como preservar a unidade escolhida e confirma que a persistência não será sincronizada entre dispositivos.

### D05. Sem autenticação e sem persistência de servidor

O usuário poderá consultar o app sem criar conta. Nenhum dado de usuário será persistido no servidor.

**Justificativa:** reduz o escopo, a complexidade operacional e as responsabilidades de privacidade do MVP.

**Resolve:** necessidade de conta, autenticação, backend de preferências e sincronização entre dispositivos.

### D06. Idioma: pt-BR

A interface, mensagens, descrições climáticas e formatos de data serão apresentados em português do Brasil.

**Justificativa:** define o público linguístico inicial e evita ambiguidade de conteúdo e localização.

**Resolve:** idioma, convenção de data e idioma da primeira versão.

## Perguntas em Aberto

As decisões acima destravam o MVP, mas os pontos abaixo devem ser confirmados antes do plano técnico ou do lançamento:

1. O app será global ou terá uma região prioritária além do idioma pt-BR?
2. Quais navegadores e versões mínimas entrarão na matriz de suporte?
3. A atualização dos dados será apenas manual ou também automática? Qual será o intervalo?
4. O app deve exibir a última previsão válida quando a API estiver indisponível?
5. Qual ferramenta e quais metas de monitoramento serão usadas em produção?
6. A meta de disponibilidade de 99,5% será aplicável apenas ao frontend ou também à dependência externa?
7. O produto futuro deverá incluir favoritos, alertas, mapas, radar ou notificações?
8. Quais métricas de negócio serão usadas para avaliar adoção e sucesso do MVP?

## Critérios de Sucesso do Discovery

O discovery será considerado suficiente para iniciar o plano quando:

- o escopo do MVP estiver aprovado;
- a Open-Meteo estiver validada quanto à cobertura e ao contrato necessário;
- os critérios de previsão, unidade, idioma e persistência estiverem cobertos por testes;
- as metas de responsividade, acessibilidade, desempenho e disponibilidade forem aceitas;
- as perguntas em aberto que alteram arquitetura ou escopo tiverem responsáveis e prazo de decisão.
