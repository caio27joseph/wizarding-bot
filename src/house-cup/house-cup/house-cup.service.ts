import { Injectable } from '@nestjs/common';
import {
  CreateHouseCupInput,
  UpdateHouseCupInput,
} from './entities/house-cup.input';
import {
  Interaction,
  EmbedBuilder,
  MessagePayload,
  MessagePayloadOption,
  InteractionReplyOptions,
} from 'discord.js';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  Repository,
} from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';
import { HouseCup, HousePointResult } from './entities/house-cup.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { Cron } from '@nestjs/schedule';
import { House } from '~/core/house/entities/house.entity';
import { PointLog } from '../point-logs/entities/point-log.entity';

@Injectable()
export class HouseCupService {
  constructor(@InjectRepository(HouseCup) private repo: Repository<HouseCup>) {}

  calculateTotal(logs: PointLog[], houses: House[]) {
    const housesById: { [k: string]: House } = {};
    const logsByHouseId: { [key: string]: PointLog[] } = {};
    const totalToCalculate: { [key: string]: number } = {};
    // group log by player

    for (const house of houses) {
      housesById[house.id] = house;
      logsByHouseId[house.id] = [];
      totalToCalculate[house.id] = 0;
    }
    for (const log of logs) {
      if (!(log.houseId in logsByHouseId)) continue;
      logsByHouseId[log.houseId].push(log);
      totalToCalculate[log.houseId] += log.value;
    }

    const results: HousePointResult[] = [];
    // now separe by HousePointResult
    for (const house of houses) {
      results.push(new HousePointResult(house, logsByHouseId[house.id]));
    }
    return results;
  }
  create(createHouseCupInput: CreateHouseCupInput) {
    return 'This action adds a new pointLog';
  }

  findAll(options?: FindManyOptions<HouseCup>) {
    return this.repo.find(options);
  }

  findOne(options: FindOneOptions<HouseCup>) {
    return this.repo.findOne(options);
  }

  update(id: string, updateHouseCupInput: UpdateHouseCupInput) {
    return this.repo.update({ id }, updateHouseCupInput);
  }

  remove(id: string) {
    return this.repo.delete({ id });
  }

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

  getTotalDisplay(results: HousePointResult[]) {
    //champions
    // sort results by total
    const sortedTotal = results.sort((a, b) => b.total - a.total);

    const embeds: EmbedBuilder[] = [];
    const first = sortedTotal[0];
    const rest = sortedTotal.slice(1);
    embeds.push(
      first
        .toEmbed()
        .setTitle(`Liderança: ${first.house?.title || 'Sem nome'}`),
    );

    let count = 2;
    for (const result of rest) {
      const embed = result
        .toShortEmbed()
        .setTitle(`${count}º Lugar: ${result.house?.title || 'Casa sem nome'}`);
      embeds.push(embed);
      count += 1;
    }
    return {
      embeds,
    };
  }
}
