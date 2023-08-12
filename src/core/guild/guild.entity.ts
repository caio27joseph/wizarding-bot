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
import { Spell } from '~/spell/entities/spell.entity';

@Entity()
export class Guild {
  @PrimaryColumn()
  id: string;

  @Column()
  modRoleId: string;

  @Column()
  prefix: string;

  @Column({
    default: true,
  })
  importSpells: boolean;

  @OneToMany((type) => Player, (player) => player.guild, {
    cascade: true,
  })
  players: Player[];

  @OneToMany((type) => House, (house) => house.guild, {
    cascade: true,
  })
  houses: House[];

  @OneToMany((type) => HouseCup, (cup) => cup.guild, {
    cascade: true,
  })
  cups: HouseCup[];

  @OneToMany((type) => Spell, (spell) => spell.guild, {
    cascade: true,
  })
  spells: Spell[];

  async verifyMod(member: GuildMember) {
    if (member.roles.cache.has(this.modRoleId)) return this;
    throw new AdminNeeded();
  }
}
