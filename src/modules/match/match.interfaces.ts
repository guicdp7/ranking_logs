import { MatchLog } from './entities/match-log.entity';
import { MatchPlayer } from './entities/match-player.entity';
import { Match } from './entities/match.entity';

export interface MatchLogConverted {
  match: Partial<Match>;
  logs: Partial<MatchLog>[];
  players: Partial<MatchPlayer>[];
}

export type WeaponUsageByPlayerType = Record<string, Record<string, number>>;
