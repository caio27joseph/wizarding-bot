import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Guild } from './guild.entity';
import { Repository } from 'typeorm';
import {
  CommandInteraction,
  Guild as DiscordGuild,
  GuildMember,
} from 'discord.js';
import { GuildSetupNeeded } from '~/discord/exceptions';
import { CreateGuildInput } from './guild.input';

@Injectable()
export class GuildService implements OnModuleInit {
  public readonly guilds: Map<string, Guild> = new Map();

  constructor(@InjectRepository(Guild) public repo: Repository<Guild>) {}

  async onModuleInit() {
    const allGuilds = await this.repo.find();

    for (const guild of allGuilds) {
      this.guilds.set(guild.id, guild);
    }
  }

  async create(createHouseInput: CreateGuildInput) {
    const data = this.repo.create(createHouseInput);
    const guild = await this.repo.save(data);
    this.guilds.set(guild.id, guild);
    return guild;
  }

  async get<T extends { guild: DiscordGuild }>(target: T) {
    return this.guilds.get(target.guild.id);
  }

  async updateGuild(guild: Guild) {
    const result = await this.repo.save(guild);
    this.guilds.set(guild.id, result);
    return result;
  }
}
