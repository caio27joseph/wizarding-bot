import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { ResourceProvider } from './resource-provider.entity';
import { Player } from '~/core/player/entities/player.entity';

@Entity()
export class ProviderPlayerHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ResourceProvider)
  @JoinColumn()
  provider: ResourceProvider;

  @ManyToOne(() => Player)
  @JoinColumn()
  player: Player;

  @Column()
  playerId: string;

  @Column()
  lastTimeOpened: Date;

  @Column()
  lastTimeSearched: Date;
}
