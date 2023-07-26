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
  ArgGuildMember,
  ArgInteraction,
  ArgRole,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { HouseService } from '../house/house.service';
import { House } from '../house/house.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guild, Guild as GuildEntity } from './guild.entity';
import e from 'express';
import { AdminNeeded } from '~/discord/exceptions';
import { GuildService } from './guild.service';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';

@Injectable()
@Group({
  name: 'guild',
  description: 'Comandos para o servidor',
})
export class GuildGroup {
  constructor(
    private houseService: HouseService,
    @InjectRepository(House) private houseRepo: Repository<House>,
    @InjectRepository(Guild) private repo: Repository<Guild>,
    private service: GuildService,
  ) {}

  @Command({
    name: 'setup',
    description: 'Comando para inciar o bot dentro de seu servidor',
  })
  public async setup(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuildMember()
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
    const data = this.repo.create({
      discordId: member.guild.id,
      modRoleId: role.id,
      prefix: prefix || '!',
    });
    guild = await this.repo.save(data);
    return await interaction.reply('Guild configurada com sucesso');
  }
  @Command({
    name: 'setup2',
    description: 'Teste 2',
  })
  public async setup2() {}
  @Command({
    name: 'setup3',
    description: 'Teste 3',
  })
  public async setup3() {}
}
