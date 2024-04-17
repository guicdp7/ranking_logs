import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Match } from './match.entity';

@Entity('match_players')
export class MatchPlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  matchId: number;

  @Column('varchar')
  name: string;

  @Column('int')
  numberOfFrags: number;

  @Column('int')
  numberOfDeaths: number;

  @Column('varchar', { nullable: true })
  favoriteWeapon: string;

  @ManyToOne(() => Match, (match) => match.players)
  @JoinColumn({ name: 'matchId' })
  match: Match;
}
