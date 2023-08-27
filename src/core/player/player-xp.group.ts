import { Injectable } from '@nestjs/common';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import { PlayerService } from './player.service';
import {
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction } from 'discord.js';
import { Player } from './entities/player.entity';

@Group({
  name: 'xp',
  description: 'Comandos relacionado ao xp do personagem',
})
@Injectable()
export class PlayerXPGroup {
  constructor(private readonly service: PlayerService) {}

  @Command({
    name: 'dar',
    description: 'Adiciona xp ao personagem',
    mod: true,
  })
  async addXP(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgInteger({ name: 'quantidade' })
    quantity: number,
  ) {
    player.xp += quantity;
    await this.service.save(player);
    await interaction.reply({
      content: `Adicionado ${quantity}xp ao personagem ${player.name}`,
      embeds: [player.toEmbed()],
      ephemeral: true,
    });
  }
}
