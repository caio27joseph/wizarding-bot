import {
  Column,
  Entity,
  JoinColumn,
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Player)
  @JoinColumn()
  player: Player;

  @Column()
  playerId: string;

  @ManyToMany(() => Spell, {
    eager: true,
  })
  @JoinTable()
  spells: Spell[];
}
