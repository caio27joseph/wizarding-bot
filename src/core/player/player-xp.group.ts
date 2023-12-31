import { Injectable } from '@nestjs/common';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import { PlayerService } from './player.service';
import {
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction } from 'discord.js';
import { Player } from './entities/player.entity';
import { PlayerChangeLogService } from './player-change-log.service';

@Group({
  name: 'xp',
  description: 'Comandos relacionado ao xp do personagem',
})
@Injectable()
export class PlayerXPGroup {
  constructor(
    private readonly service: PlayerService,
    private readonly logSaver: PlayerChangeLogService,
  ) {}

  @Command({
    name: 'dar',
    description: 'Adiciona xp ao personagem',
    mod: true,
  })
  async addXP(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgInteger({ name: 'quantidade' })
    quantity: number,
    @ArgPlayer()
    giver: Player,
    @ArgPlayer({
      name: 'jogador',
      description: 'Jogador para adicionar xp',
    })
    receiver: Player,
    @ArgString({
      name: 'Motivo',
      description: 'Motivo para adicionar o xp',
    })
    reason: string,
  ) {
    receiver.xp += quantity;
    await this.service.save(receiver);
    await this.logSaver.create({
      giver,
      receiver,
      field: 'xp',
      oldValue: (receiver.xp - quantity).toString(),
      newValue: receiver.xp.toString(),
      value: quantity.toString(),
      reason,
    });
    await interaction.reply({
      content: `Adicionado ${quantity} XP ao personagem ${receiver.name}`,
      embeds: [receiver.toEmbed()],
      ephemeral: true,
    });
  }
}
