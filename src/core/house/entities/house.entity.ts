import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  OneToMany,
} from 'typeorm';
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
import { Guild } from '~/core/guild/guild.entity';
import { Player } from '~/core/player/entities/player.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class House implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  imageUrl?: string;

  @Column()
  @Field()
  discordRoleId: string;

  @Column()
  @Field({ nullable: true })
  color?: number;

  @ManyToOne((type) => Guild, (guild) => guild.players)
  // @Field((type) => Guild)
  guild: Guild;
  @Field(() => ID)
  guildId: string;

  @OneToMany((type) => PointLog, (log) => log.player)
  @Field((type) => [PointLog])
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
