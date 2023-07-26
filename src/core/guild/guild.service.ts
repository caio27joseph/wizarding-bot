import { Global, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Guild } from './guild.entity';
import { Repository } from 'typeorm';
import {
  ButtonInteraction,
  CommandInteraction,
  Guild as DiscordGuild,
  GuildMember,
  Message,
} from 'discord.js';
import { GuildSetupNeeded } from '~/discord/exceptions';

@Injectable()
export class GuildService {
  constructor(@InjectRepository(Guild) private repo: Repository<Guild>) {}

  get<T extends { guild: DiscordGuild }>(data: T) {
    return this.repo.findOneBy({
      discordId: data.guild.id,
    });
  }
  async isMod(member: GuildMember) {
    const guild = await this.get(member);
    if (!guild) {
      throw new GuildSetupNeeded();
    }
    return member.roles.cache.has(guild.modRoleId);
  }
}
