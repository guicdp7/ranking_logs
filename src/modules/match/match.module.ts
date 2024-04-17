import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MatchLog } from './entities/match-log.entity';
import { MatchPlayer } from './entities/match-player.entity';
import { Match } from './entities/match.entity';
import { MatchPersistService } from './match-persist.service';
import { MatchSearchService } from './match-search.service';
import { MatchService } from './match.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchPlayer, MatchLog])],
  providers: [MatchPersistService, MatchSearchService, MatchService],
  exports: [MatchService],
})
export class MatchModule {}
