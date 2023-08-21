import { Injectable } from '@nestjs/common';
import { CreatePlayerInput, UpdatePlayerInput } from './entities/player.input';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
} from 'typeorm';
import { Player } from './entities/player.entity';
import { Guild } from '../guild/guild.entity';
import { HouseService } from '../house/house.service';
import { GuildMember } from 'discord.js';
import { GuildSetupNeeded } from '~/discord/exceptions';
import { BasicService } from '~/utils/basic.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class PlayerService extends BasicService<
  Player,
  DeepPartial<Player>,
  QueryDeepPartialEntity<Player>
> {
  entityName: 'Personagem';
  constructor(
    @InjectRepository(Player) public readonly repo: Repository<Player>,
    private readonly houseService: HouseService,
  ) {
    super(repo);
  }

  async getOrCreateUpdate(input: CreatePlayerInput, update = false) {
    let player = await this.repo.findOne({
      where: {
        discordId: input.discordId,
        guildId: input.guildId,
      },
    });
    if (player && !update) return player;
    input.name =
      input.name ||
      input.target?.nickname ||
      input.target?.displayName ||
      input.target?.user.username;
    if (player && update) {
      const result = await this.repo.update(player.id, input);
      return this.repo.findOneBy({ id: player.id });
    }
    const data = this.repo.create(input);
    return this.repo.save(data);
  }

  async definePlayerHouse(guild: Guild, player: Player, member: GuildMember) {
    const houses = await this.houseService.findAll({
      where: {
        guild: {
          id: guild.id,
        },
      },
    });
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
