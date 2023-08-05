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

@Injectable()
export class HouseCupService {
  constructor(@InjectRepository(HouseCup) private repo: Repository<HouseCup>) {}

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

  getTotalDisplay(
    interaction: Interaction,
    results: HousePointResult[],
    options?: InteractionReplyOptions,
  ) {
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
      ...options,
    });
  }
}
