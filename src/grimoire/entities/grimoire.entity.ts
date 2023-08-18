import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { Spell } from '~/spell/entities/spell.entity';

@Entity()
export class Grimoire {
  @PrimaryGeneratedColumn(`uuid`)
  id: string;

  @OneToOne(() => Player)
  player: Player;

  @Column()
  playerId: string;

  @ManyToMany(() => Spell)
  @JoinTable()
  spells: Spell[];
}
