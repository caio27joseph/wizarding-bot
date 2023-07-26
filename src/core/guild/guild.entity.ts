import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '../core.entity';
import { House } from '../house/house.entity';
import { HouseCup } from '~/house-cup/house-cup.entity';

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
