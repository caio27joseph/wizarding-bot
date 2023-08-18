import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Guild } from './guild.entity';
import { Repository } from 'typeorm';
import {
  CommandInteraction,
  Guild as DiscordGuild,
  GuildMember,
  TextChannel,
} from 'discord.js';
import { GuildSetupNeeded } from '~/discord/exceptions';
import { CreateGuildInput } from './guild.input';
import { DiscordEventEmitter } from '~/discord/discord.event-emitter';

@Injectable()
export class GuildService implements OnModuleInit {
  public readonly guilds: Map<string, Guild> = new Map();

  constructor(
    @InjectRepository(Guild) public repo: Repository<Guild>,
    @Inject(forwardRef(() => DiscordEventEmitter))
    private readonly discordEmitter: DiscordEventEmitter,
  ) {}

  async onModuleInit() {
    const allGuilds = await this.repo.find();

    for (let guild of allGuilds) {
      guild = await this.loadTrainChannel(guild);
      guild = await this.loadPointLogsChannel(guild);
      guild = await this.loadErrorLogsChannel(guild);

      this.guilds.set(guild.id, guild);
    }
  }
  async loadTrainChannel(guild: Guild) {
    if (!guild.trainLogChannelId) return guild;
    try {
      const fetchedChannel = await this.discordEmitter.client.channels.fetch(
        guild.trainLogChannelId,
        {
          allowUnknownGuild: true,
          cache: true,
          force: true,
        },
      );
      guild.trainLogChannel = fetchedChannel as TextChannel;
    } catch (error) {
      console.log(error);
    }
    return guild;
  }
  async loadPointLogsChannel(guild: Guild) {
    if (!guild.pointLogChannelId) return guild;
    try {
      const fetchedChannel = await this.discordEmitter.client.channels.fetch(
        guild.pointLogChannelId,
        {
          allowUnknownGuild: true,
          cache: true,
          force: true,
        },
      );
      guild.pointLogChannel = fetchedChannel as TextChannel;
    } catch (error) {
      console.log(error);
    }
    return guild;
  }
  async loadErrorLogsChannel(guild: Guild) {
    if (!guild.errorLogChannelId) return guild;
    try {
      const fetchedChannel = await this.discordEmitter.client.channels.fetch(
        guild.errorLogChannelId,
        {
          allowUnknownGuild: true,
          cache: true,
          force: true,
        },
      );
      guild.errorLogChannel = fetchedChannel as TextChannel;
    } catch (error) {
      console.log(error);
    }
    return guild;
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
