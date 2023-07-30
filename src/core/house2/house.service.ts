import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guild } from '../guild/guild.entity';
import {
  CommandInteraction,
  EmbedBuilder,
  Interaction,
  MessagePayload,
  Role,
} from 'discord.js';
import { EntityAlreadyExists } from '~/discord/exceptions';
import { House } from '../house/entities/house.entity';

@Injectable()
export class OldHouseService {
  constructor(
    @InjectRepository(House) private readonly repo: Repository<House>,
  ) {}

  getGuildHouses(guild: Guild) {
    return this.repo.findBy({
      guild: {
        id: guild.id,
      },
    });
  }

  async get({ guild, role }: { guild: Guild; role: Role }) {
    const house = await this.repo.findOne({
      where: { guild: { id: guild.id }, discordRoleId: role.id },
    });
    return house;
  }
  // async create({ guild, ...dto }: CreateHouseDto) {
  //   const exists = await this.repo.findOneBy({
  //     guild: { id: guild.id },
  //     discordRoleId: dto.discordRoleId,
  //   });
  //   if (exists)
  //     throw new EntityAlreadyExists(
  //       "Casa ja existente, use '/casa atualizar' para atualizar a casa",
  //     );
  //   const data = this.repo.create({
  //     guild,
  //     ...dto,
  //   });
  //   return this.repo.save(data);
  // }
  async remove({ guild, role }: { guild: Guild; role: Role }) {
    const deleted = await this.repo.delete({
      guild: { id: guild.id },
      discordRoleId: role.id,
    });
    return deleted;
  }
  async list({ guild }: { guild: Guild }) {
    const houses = await this.repo.findBy({
      guild: { id: guild.id },
    });
    return houses;
  }

  // async update(house: House, dto: UpdateHouseDto) {
  //   const updated = await this.repo.update(house.id, dto);
  //   const newHouse = await this.repo.findOneBy({ id: house.id });
  //   return newHouse;
  // }

  listPayload(interaction: CommandInteraction, houses: House[]) {
    return new MessagePayload(interaction as Interaction, {
      embeds: houses.map((h) =>
        new EmbedBuilder({
          color: h.color,
        }).setTitle('Casa'),
      ),
    });
  }
}
