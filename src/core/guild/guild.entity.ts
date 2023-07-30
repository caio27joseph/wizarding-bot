import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HouseCup } from '~/house-cup/house-cup/entities/house-cup.entity';
import { House } from '../house/entities/house.entity';
import { Player } from '../player/entities/player.entity';

@Entity()
export class Guild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  discordId: string;

  @Column()
  modRoleId: string;

  @Column()
  prefix: string;

  @OneToMany((type) => Player, (player) => player.guild)
  players: Player[];

  @OneToMany((type) => House, (house) => house.guild)
  houses: House[];

  @OneToMany((type) => HouseCup, (cup) => cup.guild)
  cups: HouseCup[];
}
