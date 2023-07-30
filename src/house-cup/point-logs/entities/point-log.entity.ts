import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { EmbedBuilder, Interaction, MessagePayload } from 'discord.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { House } from '~/core/house/entities/house.entity';
import { HouseCup } from '~/house-cup/house-cup/entities/house-cup.entity';

@ObjectType()
@Entity()
export class PointLog {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  @Column()
  @Field()
  value: number;

  @ManyToOne((type) => Player, (player) => player.pointLogs)
  player: Player;

  @Column()
  @Field()
  playerId: string;

  @ManyToOne((type) => House, (house) => house.pointLogs)
  house: House;

  @Column()
  @Field()
  houseId: string;

  @ManyToOne((type) => HouseCup, (cup) => cup.pointLogs)
  @Field((type) => HouseCup)
  cup: HouseCup;

  @Column()
  @Field()
  cupId: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  toEmbeds() {
    const embeds = new EmbedBuilder({
      color: this.house.color,
    })
      .setAuthor({
        name: this.player.name || 'Jogador sem nome',
        iconURL:
          this.player.avatarUrl ||
          'https://media.discordapp.net/attachments/1134366574149648404/1134673167831539753/harry-potter.png?width=192&height=192',
      })
      .setTitle(`${this.value.toString()} pontos para ${this.house.title}!`)
      .setFooter({
        text: this.createdAt.toLocaleString('pt-BR'),
      });
    if (this.house?.imageUrl) embeds.setImage(this.house.imageUrl);
    return embeds;
  }
  reply(interaction: Interaction): MessagePayload {
    const reply = new MessagePayload(interaction, {
      content: 'Taca das Casas',
      embeds: [this.toEmbeds()],
    });
    return reply;
  }
}
