import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Match } from './entities/match.entity';

@Injectable()
export class MatchSearchService {
  constructor(
    @InjectRepository(Match)
    private repository: Repository<Match>,
  ) {}

  findAll() {
    return this.repository.find({
      relations: ['players', 'logs'],
    });
  }

  findOne(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: ['players', 'logs'],
    });
  }
}
