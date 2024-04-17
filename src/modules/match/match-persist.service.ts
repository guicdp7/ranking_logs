import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MatchLog } from './entities/match-log.entity';
import { MatchPlayer } from './entities/match-player.entity';
import { Match } from './entities/match.entity';
import { MaxPlayersExceededException } from './exceptions/max-players-exceeded.exception';
import { MatchSearchService } from './match-search.service';

@Injectable()
export class MatchPersistService {
  constructor(
    @InjectRepository(Match)
    private repository: Repository<Match>,
    @InjectRepository(MatchPlayer)
    private playerRepository: Repository<MatchPlayer>,
    @InjectRepository(MatchLog)
    private logRepository: Repository<MatchLog>,
    private search: MatchSearchService,
  ) {}

  async save(
    match: Partial<Match>,
    logs: Partial<MatchLog>[] = [],
    players: Partial<MatchPlayer>[] = [],
  ) {
    if (players.length > 20) {
      throw new MaxPlayersExceededException();
    }

    const savedMatch = await this.repository.save(
      this.repository.create(match),
    );
    await Promise.all(
      logs.map(async (item) =>
        this.logRepository.save(
          this.logRepository.create({ ...item, matchId: savedMatch.id }),
        ),
      ),
    );
    await Promise.all(
      players.map(async (item) =>
        this.playerRepository.save(
          this.playerRepository.create({ ...item, matchId: savedMatch.id }),
        ),
      ),
    );
    return this.search.findOne(savedMatch.id);
  }
}
