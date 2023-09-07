import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { Spell } from '~/spell/entities/spell.entity';

@Entity()
export class LearnLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Spell, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  spell?: Spell;

  @Column({
    nullable: true,
  })
  spellId?: string;

  @ManyToOne(() => Player, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  player?: Player;

  @CreateDateColumn()
  createdAt: Date;
}
