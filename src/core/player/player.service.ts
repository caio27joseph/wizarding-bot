import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../core.entity';
import { Repository } from 'typeorm';
import { GuildMember } from 'discord.js';
import { Guild } from '../guild/guild.entity';
import { HouseService } from '../house/house.service';
import { GuildSetupNeeded } from '~/discord/exceptions';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player) private readonly repo: Repository<Player>,
    private readonly houseService: HouseService,
  ) {}

  async getByMember(guild: Guild, member: GuildMember) {
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
