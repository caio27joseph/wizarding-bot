import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EmbedBuilder, Interaction, MessagePayload } from 'discord.js';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { House } from '~/core/house/entities/house.entity';
import { DiscordEntityVieable } from '~/discord/types';
import { PointLog } from '~/house-cup/point-logs/entities/point-log.entity';

@ObjectType()
@Entity()
export class Player implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  avatarUrl?: string;

  @Index()
  @Column()
  @Field()
  discordId: string;

  @ManyToOne((type) => Guild, (guild) => guild.players)
  guild?: Guild;

  @Column()
  @Field(() => ID)
  guildId: string;

  @ManyToOne((type) => House, (house) => house.players, {
    nullable: true,
    eager: true,
  })
  @Field((type) => House)
  house?: House;

  @Column({
    nullable: true,
  })
  @Field(() => ID, { nullable: true })
  houseId?: string;

  @OneToMany((type) => PointLog, (log) => log.player)
  @Field((type) => [PointLog])
  pointLogs?: PointLog[];

  toEmbed() {
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
      embeds: [this.toEmbed()],
    });
  }
}
