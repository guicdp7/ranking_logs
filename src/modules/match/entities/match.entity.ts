import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MatchLog } from './match-log.entity';
import { MatchPlayer } from './match-player.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  identifier: string;

  @Column('int')
  numberOfFrags: number;

  @Column('varchar')
  playerThatWon: string;

  @Column('varchar', { nullable: true })
  favoriteWeapon: string;

  @Column('datetime')
  startedAt: Date;

  @Column('datetime')
  finishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => MatchPlayer, (player) => player.match)
  players: MatchPlayer[];

  @OneToMany(() => MatchLog, (log) => log.match)
  logs: MatchLog[];
}
