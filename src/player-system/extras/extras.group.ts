import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction } from 'discord.js';
import { ExtrasService } from './extras.service';
import { Repository } from 'typeorm';
import { Extras, ExtrasDisplayEnum } from './entities/extras.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';
import { Injectable } from '@nestjs/common';

@Group({
  name: 'extras',
  description: 'Comandos relacionados a configuracao de atributos',
})
@Injectable()
export class ExtrasGroup {
  constructor(private readonly service: ExtrasService) {}

  @Command({
    name: 'ver',
    description: 'Mostra os atributos do personagem',
  })
  async showExtras(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
  ) {
    const extras = await this.service.findOne({
      where: { playerId: player.id },
    });
    if (!extras)
      throw new DiscordSimpleError(
        "Você não possui atributos, use o comando 'atb atualizar' para criar seus atributos.",
      );

    await interaction.reply({
      embeds: [extras.toEmbed()],
      ephemeral: true,
    });
    return;
  }

  @Command({
    name: 'atualizar',
    description: 'Atualiza os atributos do personagem',
  })
  async updateExtras(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,

    @ArgInteger({
      name: ExtrasDisplayEnum.WILLPOWER,
      description: `${ExtrasDisplayEnum.WILLPOWER} do personagem.`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    })
    willpower?: number,
    @ArgInteger({
      name: ExtrasDisplayEnum.AFFINITY,
      description: `${ExtrasDisplayEnum.AFFINITY} do personagem.`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    })
    affinity?: number,
    @ArgInteger({
      name: ExtrasDisplayEnum.CONTROL,
      description: `${ExtrasDisplayEnum.CONTROL} do personagem.`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    })
    control?: number,
    @ArgInteger({
      name: ExtrasDisplayEnum.SORCERY,
      description: `${ExtrasDisplayEnum.SORCERY} do personagem.`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    })
    sorcery?: number,
  ) {
    const extras = await this.service.updateOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
        willpower,
        affinity,
        control,
        sorcery,
      },
    );
    await interaction.reply({
      embeds: [extras.toEmbed()],
      ephemeral: true,
    });
    return;
  }
}
