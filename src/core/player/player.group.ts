import { Controller, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../core.entity';
import { Repository } from 'typeorm';
import { Group } from '~/discord/decorators/group.decorator';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgAuthorMember,
  ArgInteraction,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction, GuildMember } from 'discord.js';
import { PlayerService } from './player.service';
import { GuildService } from '../guild/guild.service';

@Group({
  name: 'pj',
  description: 'Comandos relacionado ao proprio personagem',
})
@Injectable()
export class PlayerGroup {
  constructor(
    private readonly service: PlayerService,
    private readonly guildService: GuildService,
  ) {}

  @Command({
    name: 'atualizar',
    description: 'Adiciona informacoes ao personagem',
  })
  async update(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgAuthorMember()
    author: GuildMember,
    @ArgString({ name: 'name', required: false })
    name?: string,
    @ArgString({ name: 'avatarUrl', required: false })
    avatarUrl?: string,
  ) {
    const guild = await this.guildService.get(author);
    const player = await this.service.getOrCreateUpdate(
      {
        discordId: author.id,
        guild,
        avatarUrl,
        name,
      },
      true,
    );
    return player;
  }
}
