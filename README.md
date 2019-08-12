# To De Olho! - Server

## Colaboradores
[@MBAlexandreMB](https://github.com/MBAlexandreMB) - Alexandre Montesso Bonomi

[@ABettega](https://github.com/ABettega) - Aroldo Bettega Neto

[@gabrieladias99](https://github.com/gabrieladias99) - Gabriela Dias

[@porissawa](https://github.com/porissawa) - Pedro Morissawa

## O que é o [To De Olho!](https://to-de-olho-app.herokuapp.com)?
O aplicativo nasceu da necessidade de acompanhar a atuação dos políticos eleitos, para facilitar a prestação de contas para com o povo. A Lei de Acesso a Informação nos garante que todos os dados pertinentes estão livremente disponíveis na web. O Tô De Olho apenas categoriza estes dados de forma mais simples para o usuário.

## Detalhes do desenvolvimento
### Features
- Leitura de APIs do Senado e Congresso para categorização das informações no Banco de Dados
- Web Scraper para captura de dados que não estão disponíveis na API do Congresso
- Possibilidade do usuário marcar políticos para verificar as informações dele mais facilmente
- Facilidade para ver todas as informações de presenças e votos de cada político em todas as sessões e votações
- Desenvolvimento Mobile-First
### Dificuldades
- A API do Senado, apesar de completa, é muito mal organizada. Foi necessário muito tempo para que os dados fossem trabalhados de modo a ficarem facilmente compreensíveis.
- A API do Congresso ainda está em desenvolvimento, portanto várias e várias informações precisaram ser buscadas no site do Congresso diretamente, sem API. Para isso, foi desenvolvido um Web Scraper para a captura direta, o que demandou muito tempo e esforço técnico.
- Outro problema decorrente do fato de a API do Congresso não estar pronta é que as informações nos sites eram inseridas de forma irregular - ou seja, em diversos casos fugiam do padrão, que levava a um retrabalho para realizar a captura corretamente.

### Passos Futuros
- Migrar para um ambiente AWS para que as demandas do servidor sejam automaticamente atendidas
- Captura de dados de forma automática (via Cron jobs)
- Envio de email automático para os usuários referente os políticos marcados após cada sessão e votação
- Mais informações no banco de dados como gastos de cada político.
