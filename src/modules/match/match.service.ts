import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

import { LogLine } from '../logProcessor/log-processor.interfaces';
import { MatchPlayer } from './entities/match-player.entity';
import { Match } from './entities/match.entity';

@Injectable()
export class MatchService {
  async convertLogsToMatches(logs: Readable) {
    return new Promise((resolve) => {
      let actualMatchId: string;
      const matches: { match: Partial<Match>; logs: LogLine[] }[] = [];
      logs.on('data', (chunk: Buffer) => {
        const log = JSON.parse(chunk.toString()) as LogLine;
        if (log.type === 'match_started') {
          actualMatchId = log.details.id;
          matches.push({
            logs: [],
            match: {
              identifier: actualMatchId,
              startedAt: log.date,
            },
          });
        }

        if (
          ['hit_kill', 'world_kill', 'match_ended'].includes(log.type) &&
          actualMatchId !== undefined
        ) {
          const index = matches.findIndex(
            (item) => item.match.identifier === actualMatchId,
          );
          if (index === -1) {
            return;
          }

          if (log.type !== 'match_ended') {
            matches[index].logs.push(log);
          }

          if (log.type === 'match_ended') {
            matches[index].match.finishedAt = log.date;
            actualMatchId = undefined;
          }
        }
      });

      logs.on('end', () => {
        const result = matches.map((item) =>
          this.calcMatchDetails(item.match, item.logs),
        );
        resolve(result);
      });
    });
  }

  private calcMatchDetails(match: Partial<Match>, logs: LogLine[]) {
    let players: Partial<MatchPlayer>[] = [];
    const weaponUsageByPlayer: Record<string, Record<string, number>> = {};

    const pushPlayer = (name: string) => {
      if (!players.find((item) => item.name === name)) {
        players.push({
          name,
        });
      }
    };

    logs.forEach((item) => {
      pushPlayer(item.details.player);
      if (item.type === 'hit_kill') {
        pushPlayer(item.details.killedBy);
      }
    });

    players.forEach((player) => {
      weaponUsageByPlayer[player.name] = logs.reduce((result, item) => {
        if (item.type === 'hit_kill' && item.details.killedBy === player.name) {
          return {
            ...result,
            [item.details.weapon]: (result[item.details.weapon] ?? 0) + 1,
          };
        }
        return result;
      }, {});
    });

    players = players.map((player) => ({
      ...player,
      favoriteWeapon: Object.keys(weaponUsageByPlayer[player.name]).sort(
        (a, b) =>
          weaponUsageByPlayer[player.name][a] >
          weaponUsageByPlayer[player.name][b]
            ? -1
            : 1,
      )[0],
      numberOfFrags: logs.filter(
        (item) =>
          item.type === 'hit_kill' && item.details.killedBy === player.name,
      ).length,
      numberOfDeaths: logs.filter(
        (item) =>
          ['hit_kill', 'world_kill'].includes(item.type) &&
          item.details.player === player.name,
      ).length,
    }));

    match.numberOfFrags = logs.filter(
      (item) => item.type === 'hit_kill',
    ).length;

    const playerThatWon = players.sort((a, b) =>
      a.numberOfFrags > b.numberOfFrags
        ? -1
        : a.numberOfFrags === b.numberOfFrags
          ? a.numberOfDeaths > b.numberOfDeaths
            ? 1
            : -1
          : 1,
    )[0];

    match.playerThatWon = playerThatWon.name;
    match.favoriteWeapon = playerThatWon.favoriteWeapon;

    return {
      match,
      logs,
      players,
    };
  }
}
