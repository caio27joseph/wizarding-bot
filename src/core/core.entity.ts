import {
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guild } from './guild/guild.entity';
import { PointLog } from '~/house-cup/house-cup.entity';
import { House } from './house/house.entity';
import { DiscordEntityVieable } from '~/discord/types';
import { EmbedBuilder } from '@discordjs/builders';
import { Interaction, MessagePayload } from 'discord.js';

@Entity()
export class Player implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500, nullable: true })
  name?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Index()
  @Column()
  discordId: string;

  @ManyToOne((type) => Guild, (guild) => guild.players)
  guild?: Guild;

  @ManyToOne((type) => House, (house) => house.players, {
    eager: true,
  })
  house?: House;

  @OneToMany((type) => PointLog, (log) => log.player)
  pointLogs?: PointLog[];

  toEmbeds() {
    const embeds = new EmbedBuilder();
    embeds.setTitle(this?.name || 'Defina nome usando /pj atualizar');
    if (this.avatarUrl) embeds.setImage(this.avatarUrl);
    if (this.house) {
      embeds.addFields({
        name: 'Casa ',
        value: this.house?.title || '<Definir Nome>',
      });
      embeds.setColor(this.house.color);
    }
    return embeds;
  }
  reply(interaction: Interaction) {
    return new MessagePayload(interaction, {
      embeds: [this.toEmbeds()],
    });
  }
}
