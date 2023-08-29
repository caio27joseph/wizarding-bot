import {
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Stack } from './stack.entity';
import { Player } from '~/core/player/entities/player.entity';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Stack, (stack) => stack.inventory, {
    cascade: true,
  })
  stacks: Stack[];

  @OneToOne(() => Player, (player) => player.inventory, {
    nullable: true,
  })
  @JoinColumn()
  player?: Player;
}
