import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { Spell } from '~/spell/entities/spell.entity';

@Entity()
export class Learn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Spell, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  spell: Spell;

  @ManyToOne(() => Player, {
    nullable: true,
  })
  @JoinColumn()
  player: Player;

  @Column({
    default: 0,
  })
  progress: number;
}
