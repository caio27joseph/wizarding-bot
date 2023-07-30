import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Guild } from '../guild/guild.entity';
import { Player } from '../core.entity';
import {
  CommandInteraction,
  Embed,
  EmbedBuilder,
  Interaction,
  InteractionReplyOptions,
  MessagePayload,
} from 'discord.js';
import { DiscordEntityVieable } from '~/discord/types';
import { PointLog } from '~/house-cup/point-logs/entities/point-log.entity';

@Entity()
export class House implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  discordRoleId: string;

  @Column()
  color?: number;

  @ManyToOne((type) => Guild, (guild) => guild.players)
  guild: Guild;

  @OneToMany((type) => PointLog, (log) => log.player)
  pointLogs: PointLog[];

  @OneToMany((type) => Player, (player) => player.guild)
  players: Player[];

  toEmbeds(): EmbedBuilder {
    return new EmbedBuilder({
      title: this?.title,
      footer: {
        text: this.id,
      },
      color: this.color,
    }).setImage(this.imageUrl);
  }
  reply(interaction: Interaction) {
    return new MessagePayload(interaction, {
      embeds: [this.toEmbeds()],
    });
  }
}
