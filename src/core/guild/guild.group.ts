import { Injectable } from '@nestjs/common';
import {
  CommandInteraction,
  Message as DiscordMessage,
  GuildMember,
  PermissionsBitField,
  Role,
  TextChannel,
} from 'discord.js';
import {
  ArgBoolean,
  ArgAuthorMember,
  ArgInteraction,
  ArgRole,
  ArgString,
  ArgGuild,
} from '~/discord/decorators/message.decorators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guild, Guild as GuildEntity } from './guild.entity';
import e from 'express';
import { AdminNeeded } from '~/discord/exceptions';
import { GuildService } from './guild.service';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import { House } from '../house/entities/house.entity';
import { HouseService } from '../house/house.service';

@Injectable()
@Group({
  name: 'guild',
  description: 'Comandos para o servidor',
})
export class GuildGroup {
  constructor(private service: GuildService) {}

  @Command({
    name: 'setup',
    description: 'Comando para inciar o bot dentro de seu servidor',
  })
  public async setup(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgAuthorMember()
    member: GuildMember,
    @ArgRole({
      name: 'mod',
      description: 'Informe o cargo de moderador',
    })
    role: Role,
    @ArgString({ name: 'prefix', required: false })
    prefix?: string,
  ) {
    const isAdmin = member.permissions.has('Administrator');
    if (!isAdmin) {
      throw new AdminNeeded();
    }
    let guild = await this.service.get(member);
    if (guild) {
      return await interaction.reply('Guild ja configurada');
    }
    guild = await this.service.create({
      modRoleId: role.id,
      id: member.guild.id,
      prefix: prefix || '!',
    });
    return await interaction.reply('Guild configurada com sucesso');
  }

  @Command({
    name: 'set_train_log_channel',
    description: 'Comando para definir o canal de treinamento',
    mod: true,
  })
  public async setTrainLogChannel(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {
    guild.trainLogChannel = interaction.channel as TextChannel;
    guild.trainLogChannelId = interaction.channelId;
    await this.service.updateGuild(guild);
    await interaction.reply('Canal de treinamento definido');
  }
  @Command({
    name: 'set_error_log_channel',
    description: 'Comando para definir o canal de treinamento',
    mod: true,
  })
  public async setErrorLogChannel(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {
    guild.errorLogChannel = interaction.channel as TextChannel;
    guild.errorLogChannelId = interaction.channelId;
    await this.service.updateGuild(guild);
    await interaction.reply('Canal de Errors definido');
  }

  @Command({
    name: 'set_point_log_channel',
    description: 'Comando para definir o canal de treinamento',
    mod: true,
  })
  public async setPointLogChannel(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {
    guild.pointLogChannel = interaction.channel as TextChannel;
    guild.pointLogChannelId = interaction.channelId;
    await this.service.updateGuild(guild);
    await interaction.reply('Canal de pontos de casas definido');
  }
}
