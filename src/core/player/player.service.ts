import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../core.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import { GuildMember } from 'discord.js';
import { Guild } from '../guild/guild.entity';
import { HouseService } from '../house/house.service';
import { GuildSetupNeeded } from '~/discord/exceptions';
import { CreatePlayerDto } from './player.dto';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player) private readonly repo: Repository<Player>,
    private readonly houseService: HouseService,
  ) {}

  get(
    guild: Guild,
    discordId: string,
    relations?: FindOptionsRelations<Player>,
  ) {
    return this.repo.findOne({
      where: {
        discordId,
        guild: {
          id: guild.id,
        },
      },
      relations,
    });
  }
  async getOrCreateUpdate(dto: CreatePlayerDto, update = false) {
    let player = await this.repo.findOne({
      where: {
        guild: {
          id: dto.guild.id,
        },
        discordId: dto.discordId,
      },
    });
    if (player && !update) return player;
    if (player && update) {
      const result = this.repo.update(player.id, dto);
      return this.repo.findOneBy({ id: player.id });
    }
    const data = this.repo.create(dto);
    return this.repo.save(data);
  }

  async getOrCreateByMember(guild: Guild, member: GuildMember) {
    let player = await this.repo.findOne({
      where: {
        discordId: member.id,
        guild: {
          id: guild.id,
        },
      },
      relations: {
        house: true,
      },
    });
    if (!player) {
      const data = this.repo.create({
        discordId: member.id,
        guild,
      });
      data.name = member.nickname;
      player = await this.repo.save(data);
    }
    if (!player.house) await this.definePlayerHouse(guild, player, member);

    return player;
  }
  async definePlayerHouse(guild: Guild, player: Player, member: GuildMember) {
    const houses = await this.houseService.getGuildHouses(guild);
    if (!houses || houses.length === 0)
      throw new GuildSetupNeeded('Nao existe casas definida na mesa');

    const house = houses.find((h) => member.roles.cache.has(h.discordRoleId));
    if (!house)
      throw new GuildSetupNeeded(
        'O player em questao nao tem nenhum cargo de casa',
      );

    player.house = house;
    return await this.repo.save(player);
  }
}
