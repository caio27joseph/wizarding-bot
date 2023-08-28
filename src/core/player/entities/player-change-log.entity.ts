import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';

@Entity()
export class PlayerChangeLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  field: string;

  @Column({
    nullable: true,
  })
  value: string;

  @Column({
    nullable: true,
  })
  oldValue: string;

  @Column({
    nullable: true,
  })
  newValue: string;

  @Column({
    nullable: true,
  })
  reason: string;

  @ManyToOne(() => Player)
  @JoinColumn()
  player: Player;
}
