import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '~/core/core.entity';
import { House } from '~/core/house/house.entity';
import { HouseCup, HousePointResult, PointLog } from './house-cup.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { GuildService } from '~/core/guild/guild.service';
import {
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  Interaction,
  MessagePayload,
} from 'discord.js';
import { DiscordSimpleError, GuildSetupNeeded } from '~/discord/exceptions';

@Injectable()
export class HouseCupService {
  constructor(
    @InjectRepository(PointLog) private pointLogRepo: Repository<PointLog>,
    @InjectRepository(HouseCup) private repo: Repository<HouseCup>,
  ) {}
  async activateCup(cup: HouseCup) {
    cup.active = true;
    return await this.repo.save(cup);
  }

  async createCup(name: string, guild: Guild) {
    const data = this.repo.create({
      name: name,
      guild: guild,
      active: true,
    });
    const cup = await this.repo.save(data);
    return cup;
  }
  addPoints(cup: HouseCup, player: Player, value: number) {
    if (!cup.active)
      throw new DiscordSimpleError('Voce precisa iniciar a taca das casas');

    const data = this.pointLogRepo.create({
      cup,
      player,
      house: player.house,
      value: value,
    });
    return this.pointLogRepo.save(data);
  }
  calculate_player_points(player: Player) {}
  calculate_house_points(house: House) {}

  async getActiveCup(
    { guild }: { guild: Guild },
    relations?: FindOptionsRelations<HouseCup>,
  ) {
    return this.repo.findOne({
      where: {
        guild: {
          id: guild.id,
        },
        active: true,
      },
      relations,
    });
  }

  getTotalDisplay(interaction: Interaction, results: HousePointResult[]) {
    //champions
    // sort results by total
    const sortedTotal = results.sort((a, b) => b.total - a.total);

    const embeds: EmbedBuilder[] = [];
    let count = 1;
    for (const result of sortedTotal) {
      const embed = result
        .toEmbeds()
        .setTitle(`${count}º Lugar: ${result.house?.title || 'Casa sem nome'}`);
      embeds.push(embed);
      count += 1;
    }
    return new MessagePayload(interaction, {
      embeds,
    });
  }
}
