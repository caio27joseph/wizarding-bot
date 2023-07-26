import { Injectable, UseGuards } from '@nestjs/common';
import { HouseCupService } from './house-cup.service';
import { CommandInteraction, GuildMember } from 'discord.js';

import { ModGuard } from '~/core/guards/mod.guard';
import { GuildService } from '~/core/guild/guild.service';
import { HouseCup } from './house-cup.entity';
import {
  ArgInteraction,
  ArgGuildMember,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';

@Group({
  name: 'taca',
  description: 'Comandos relacionado ao jogador',
})
@Injectable()
export class HouseCupGroup {
  constructor(
    private readonly houseCupService: HouseCupService,
    private guildService: GuildService,
  ) {}

  @Command({
    name: 'iniciar',
    description: 'Inicia uma nova taca das casas',
  })
  public async startCup(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuildMember() author: GuildMember,
    @ArgString({
      name: 'name',
      description: 'O nome da taca das casas, exemplo: Taca de 1999',
    })
    name: string,
  ) {
    const isMod = await this.guildService.isMod(author);
    if (!isMod) return interaction.reply('Not Allowed');
    const guild = await this.guildService.get(author);
    let cup: HouseCup;
    if (guild.cups.length === 0) {
      cup = await this.houseCupService.createCup(name, guild);
    } else {
      cup = guild.cups.at(-1);
    }
    return this.houseCupService.activateCup(cup);
  }
  public async createCup() {}

  //   const [_, points, house] = content.split(" ")

  //   await channel.send(`${points} para ${house}, ${author}`)
  // }
}
