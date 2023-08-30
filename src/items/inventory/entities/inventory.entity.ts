import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Stack } from './stack.entity';
import { Player } from '~/core/player/entities/player.entity';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Stack, (stack) => stack.inventory, {
    cascade: true,
    eager: true,
  })
  stacks: Stack[];

  @OneToOne(() => Player, (player) => player.inventory, {
    nullable: true,
  })
  @JoinColumn()
  player?: Player;

  @Column({ type: 'timestamp', nullable: true })
  lastImageGeneratedAt?: Date;

  @Column({
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
