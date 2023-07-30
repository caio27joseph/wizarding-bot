import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  MessagePayload,
  EmbedBuilder,
  Interaction,
  APIEmbedField,
} from 'discord.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '~/core/core.entity';
import { Guild } from '~/core/guild/guild.entity';
import { House } from '~/core/house/house.entity';
import { DiscordEntityVieable } from '~/discord/types';
import { PointLog } from '../../point-logs/entities/point-log.entity';

@ObjectType()
@Entity()
export class HouseCup implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  active: boolean;

  @ManyToOne((type) => Guild, (guild) => guild.cups)
  guild: Guild;

  @Column()
  @Field()
  guildId: string;

  @OneToMany((type) => PointLog, (log) => log.cup)
  @Field((type) => [PointLog])
  pointLogs: PointLog[];

  toEmbeds() {
    return new EmbedBuilder().setTitle(this.name);
  }
  // todo: make method to calculate the current value of each house
  reply(interaction: Interaction): MessagePayload {
    const reply = new MessagePayload(interaction, {
      content: 'Taca das Casas',
      embeds: [this.toEmbeds()],
    });
    return reply;
  }
}

export class PlayerPointResult {
  player: Player;
  total: number;
  logs: PointLog[];
  constructor(player: Player, logs: PointLog[]) {
    this.player = player;
    this.logs = logs.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    this.total = logs.reduce((acc, log) => acc + log.value, 0);
  }
}
export class HousePointResult {
  house: House;
  total: number;
  logs: PointLog[];
  playerResults: { [k: string]: PlayerPointResult };
  sortedPlayerResults: PlayerPointResult[];
  constructor(house: House, logs: PointLog[]) {
    this.house = house;
    this.logs = logs.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    this.total = logs.reduce((acc, log) => acc + log.value, 0);
    this.playerResults = {};
    const logsByPlayerId: { [k: string]: PointLog[] } = {};
    const playersById: { [k: string]: Player } = {};
    for (const log of logs) {
      if (!logsByPlayerId[log.playerId]) {
        logsByPlayerId[log.playerId] = [];
        playersById[log.playerId] = log.player;
      }
      logsByPlayerId[log.playerId].push(log);
    }
    for (const [playerId, player] of Object.entries(playersById)) {
      this.playerResults[playerId] = new PlayerPointResult(
        player,
        logsByPlayerId[playerId],
      );
    }
    this.sortedPlayerResults = Object.values(this.playerResults).sort(
      (a, b) => b.total - a.total,
    );
  }

  toEmbeds(): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setAuthor({ name: `${this.total} pontos` })
      .setColor(this.house.color);
    if (this.house?.imageUrl) {
      embed.setImage(this.house.imageUrl);
    }
    if (this.house?.title) {
      embed.setTitle(this.house.title);
    }
    const top3 = this.sortedPlayerResults.slice(0, 3);
    for (const [i, playerResult] of top3.entries()) {
      embed.addFields({
        name: `${i + 1}º ${playerResult.player?.name || 'Jogador sem Nome'}`,
        value: `${playerResult.total} pontos`,
        inline: false,
      });
    }
    const whorstPlayer = this.sortedPlayerResults.at(-1);
    if (whorstPlayer && whorstPlayer.total < 0) {
      embed.addFields({
        name: `${
          whorstPlayer.player?.name || 'Jogador sem Nome'
        } pelo menos participou`,
        value: ` ${whorstPlayer.total} pontos`,
        inline: true,
      });
    }

    const lastFive = this.logs.slice(-5);
    if (!lastFive.length)
      return embed.setDescription('Nenhum ponto registrado ainda');
    let message = 'Ultimos 5 Pontos:\n';
    for (const log of lastFive) {
      // Date BR Format - Name: value
      message += `${log.createdAt.toLocaleDateString('pt-BR')} - ${
        log.player?.name || 'Jogador sem Nome'
      }: ${log.value}\n`;
    }
    embed.setDescription(message);
    return embed;
  }
}
