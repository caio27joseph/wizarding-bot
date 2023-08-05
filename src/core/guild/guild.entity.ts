import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HouseCup } from '~/house-cup/house-cup/entities/house-cup.entity';
import { House } from '../house/entities/house.entity';
import { Player } from '../player/entities/player.entity';
import { GuildMember } from 'discord.js';
import { AdminNeeded } from '~/discord/exceptions';

@Entity()
export class Guild {
  @PrimaryColumn()
  id: string;

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

  async verifyMod(member: GuildMember) {
    if (member.roles.cache.has(this.modRoleId)) return this;
    throw new AdminNeeded();
  }
}
