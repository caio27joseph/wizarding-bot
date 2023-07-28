import { Global, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Guild } from './guild.entity';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsSelectByString,
  Repository,
} from 'typeorm';
import {
  ButtonInteraction,
  CommandInteraction,
  Guild as DiscordGuild,
  GuildMember,
  Message,
} from 'discord.js';
import { GuildSetupNeeded } from '~/discord/exceptions';
import { relative } from 'path';

@Injectable()
export class GuildService {
  constructor(@InjectRepository(Guild) public repo: Repository<Guild>) {}

  async loadGuildAsMod(
    interaction: CommandInteraction,
    relations?: FindOptionsRelations<Guild>,
  ) {
    const guild = await this.repo.findOne({
      where: {
        discordId: interaction.guild.id,
      },
      relations,
    });
    if (!guild) throw new GuildSetupNeeded();
    const isMod = await this.isMod(interaction.member as GuildMember, guild);
    if (!isMod) throw interaction.reply('Not Allowed');

    return guild;
  }
  async get<T extends { guild: DiscordGuild }>(
    data: T,
    relations: FindOptionsRelations<Guild> = {},
    throwIfNotFound = true,
  ) {
    const guild = await this.repo.findOne({
      where: {
        discordId: data.guild.id,
      },
      relations,
    });
    if (!guild && throwIfNotFound) throw new GuildSetupNeeded();
    return guild;
  }
  async isMod(member: GuildMember, guild?: Guild) {
    if (!guild) {
      const guild = await this.get(member);
    }
    if (!guild) {
      throw new GuildSetupNeeded();
    }
    return member.roles.cache.has(guild.modRoleId);
  }
}
