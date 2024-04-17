import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Match } from './match.entity';

@Entity('match_logs')
export class MatchLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  matchId: number;

  @Column('varchar')
  type: string;

  @Column('varchar')
  text: string;

  @Column('datetime')
  date: Date;

  @ManyToOne(() => Match, (match) => match.logs)
  @JoinColumn({ name: 'matchId' })
  match: Match;
}
