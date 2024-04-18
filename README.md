# ranking_logs

## Descrição
A aplicação `ranking_logs` foi desenvolvida com NestJS e TypeORM para processar arquivos de logs de partidas de jogos de tiro em primeira pessoa. Ele gera um ranking dos jogadores presentes em cada partida, identifica a quantidade de frags e mortes de cada jogador, sua arma favorita e outras informações relevantes sobre a partida.

## Funcionalidades

- Processamento de arquivos de logs .txt contendo informações sobre múltiplas rodadas de partidas.
- Identificação de tipos de logs:
  - `match_started`: Início da partida.
  - `match_ended`: Fim da partida.
  - `world_kill`: Registro de morte pelo ambiente.
  - `hit_kill`: Registro de morte causada por um jogador.
- No calculo geral de cada partida, as frags realizados pelo jogador `WORLD` serão DESCONSIDERADAS.
- Possibilidade de limitar a quantidade de jogadores por partida através da variável de ambiente `MAX_PLAYERS_BY_MATCH` (padrão: 20 jogadores).
- Utilização do banco de dados SQLite para armazenamento dos dados das partidas, com o arquivo do banco localizado em `db/sql`.
- Configuração da porta da aplicação via arquivo `.env` (variável `APP_PORT`, padrão: 3000).

## Configuração

1. Certifique-se de ter o Node.js e npm instalados em sua máquina.
2. Clone o repositório `ranking_logs`.
3. Execute `npm install` para instalar as dependências do projeto.
4. Defina as variáveis de ambiente necessárias no arquivo `.env`, se necessário.
5. Execute `npm run start` para iniciar a aplicação.

## Exemplo de Arquivo de Logs

Segue um exemplo do formato de logs aceito pela aplicação:

```
24/04/2020 16:14:22 - New match 11348961 has started
24/04/2020 16:26:12 - Roman killed Marcus using M16
24/04/2020 16:35:56 - Marcus killed Jhon using AK47
24/04/2020 17:12:34 - Roman killed Bryian using M16
24/04/2020 18:26:14 - Bryan killed Marcus using AK47
24/04/2020 19:36:33 - <WORLD> killed Marcus by DROWN
24/04/2020 20:19:22 - Match 11348961 has ended
```

Certifique-se de que seus logs sigam este formato para que a aplicação possa processá-los corretamente.
