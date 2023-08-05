import { Injectable } from '@nestjs/common';
import {
  CommandInteraction,
  Message as DiscordMessage,
  GuildMember,
  PermissionsBitField,
  Role,
} from 'discord.js';
import {
  ArgBoolean,
  ArgAuthorMember,
  ArgInteraction,
  ArgRole,
  ArgString,
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
  constructor(
    private houseService: HouseService,
    @InjectRepository(House) private houseRepo: Repository<House>,
    private service: GuildService,
  ) {}

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
}
