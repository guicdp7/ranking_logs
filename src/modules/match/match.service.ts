import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

import { LogLine } from '../logProcessor/log-processor.interfaces';
import { MatchLog } from './entities/match-log.entity';
import { MatchPlayer } from './entities/match-player.entity';
import { Match } from './entities/match.entity';
import { MatchPersistService } from './match-persist.service';
import { MatchSearchService } from './match-search.service';
import { MatchLogConverted, WeaponUsageByPlayerType } from './match.interfaces';

@Injectable()
export class MatchService {
  constructor(
    private search: MatchSearchService,
    private persist: MatchPersistService,
  ) {}

  findAll() {
    return this.search.findAll();
  }

  findOne(id: number) {
    return this.search.findOne(id);
  }

  async importMatchLogs(logs: Readable) {
    const convertedData = await this.convertLogsToMatches(logs);
    return Promise.all(
      convertedData.map(({ match, logs, players }) =>
        this.persist.save(match, logs, players),
      ),
    );
  }

  private async convertLogsToMatches(
    logs: Readable,
  ): Promise<MatchLogConverted[]> {
    return new Promise((resolve) => {
      let actualMatchId: string;
      const matches: { match: Partial<Match>; logs: LogLine[] }[] = [];

      logs.on('data', (chunk: Buffer) => {
        const log = JSON.parse(chunk.toString()) as LogLine;
        const { type, details, date } = log;

        if (type === 'match_started') {
          actualMatchId = details.id;
          matches.push({
            logs: [],
            match: {
              identifier: actualMatchId,
              startedAt: date,
            },
          });
        }

        if (
          ['hit_kill', 'world_kill', 'match_ended'].includes(type) &&
          actualMatchId !== undefined
        ) {
          const index = matches.findIndex(
            (item) => item.match.identifier === actualMatchId,
          );
          if (index === -1) {
            return;
          }

          if (type !== 'match_ended') {
            matches[index].logs.push(log);
          }

          if (type === 'match_ended') {
            matches[index].match.finishedAt = date;
            actualMatchId = undefined;
          }
        }
      });

      logs.on('end', () => {
        const result = matches.map(({ match, logs }) =>
          this.calcMatchDetails(match, logs),
        );
        resolve(result);
      });
    });
  }

  private sortPlayersFromBestToLoser(
    a: Partial<MatchPlayer>,
    b: Partial<MatchPlayer>,
  ) {
    return a.numberOfFrags > b.numberOfFrags
      ? -1
      : a.numberOfFrags === b.numberOfFrags
        ? a.numberOfDeaths > b.numberOfDeaths
          ? 1
          : -1
        : 1;
  }

  private identifyMatchPlayersAndWeaponsByLogLines(logLines: LogLine[]) {
    const players: Partial<MatchPlayer>[] = [];
    const weaponUses: WeaponUsageByPlayerType = {};

    const pushPlayer = (name: string) => {
      if (!players.find((item) => item.name === name)) {
        players.push({
          name,
        });
      }
    };

    logLines.forEach(({ details, type }) => {
      pushPlayer(details.player);
      if (type === 'hit_kill') {
        pushPlayer(details.killedBy);
      }
    });

    players.forEach(({ name }) => {
      weaponUses[name] = logLines.reduce((result, { details, type }) => {
        if (type === 'hit_kill' && details.killedBy === name) {
          return {
            ...result,
            [details.weapon]: (result[details.weapon] ?? 0) + 1,
          };
        }
        return result;
      }, {});
    });
    return { players, weaponUses };
  }

  private calculatePlayerDetails(
    player: Partial<MatchPlayer>,
    logLines: LogLine[],
    weaponUses: WeaponUsageByPlayerType,
  ) {
    const { name } = player;
    return {
      name,
      favoriteWeapon: Object.keys(weaponUses[name]).sort((a, b) =>
        weaponUses[name][a] > weaponUses[name][b] ? -1 : 1,
      )[0],
      numberOfFrags: logLines.filter(
        ({ type, details }) => type === 'hit_kill' && details.killedBy === name,
      ).length,
      numberOfDeaths: logLines.filter(
        ({ type, details }) =>
          ['hit_kill', 'world_kill'].includes(type) && details.player === name,
      ).length,
    };
  }

  private calcMatchDetails(
    match: Partial<Match>,
    logLines: LogLine[],
  ): MatchLogConverted {
    const { players, weaponUses } =
      this.identifyMatchPlayersAndWeaponsByLogLines(logLines);

    const sortedPlayers: Partial<MatchPlayer>[] = players
      .map((item) => this.calculatePlayerDetails(item, logLines, weaponUses))
      .sort(this.sortPlayersFromBestToLoser)
      .map((item, index) => ({ ...item, ranking: index + 1 }));

    match.numberOfFrags = logLines.filter(
      ({ type }) => type === 'hit_kill',
    ).length;

    const playerThatWon = sortedPlayers[0];

    match.playerThatWon = playerThatWon.name;
    match.favoriteWeapon = playerThatWon.favoriteWeapon;

    const logs: Partial<MatchLog>[] = logLines.map(({ date, text, type }) => ({
      date,
      text,
      type,
    }));

    return {
      match,
      logs,
      players: sortedPlayers,
    };
  }
}
