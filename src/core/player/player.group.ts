import { Injectable } from '@nestjs/common';
import { Group } from '~/discord/decorators/group.decorator';
import { GuildService } from '../guild/guild.service';
import { PlayerService } from './player.service';
import { CommandInteraction, GuildMember } from 'discord.js';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgInteraction,
  ArgAuthorMember,
  ArgString,
} from '~/discord/decorators/message.decorators';

@Group({
  name: 'pj',
  description: 'Comandos relacionado ao proprio personagem',
})
@Injectable()
export class PlayerGroup {
  constructor(
    private readonly service: PlayerService,
    private guildService: GuildService,
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
        guildId: guild.id,
        avatarUrl,
        name,
      },
      true,
    );
    return player;
  }
}
