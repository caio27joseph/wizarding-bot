import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction } from 'discord.js';
import { WitchPredilectionsService } from './witch-predilection.service';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';
import { Injectable } from '@nestjs/common';
import { Command } from '~/discord/decorators/command.decorator';
import { WitchPredilectionDisplayEnum } from './entities/witch-predilection.entity';

@Group({
  name: 'pred_bruxa',
  description: 'Comandos relacionados a configuracao de predileções bruxas',
})
@Injectable()
export class WitchPredilectionsGroup {
  constructor(private readonly service: WitchPredilectionsService) {}

  @Command({
    name: 'ver',
    description: 'Mostra os predileções bruxas do personagem',
  })
  async showWitchPredilections(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
  ) {
    const attributes = await this.service.findOne({
      where: { playerId: player.id },
    });
    if (!attributes)
      throw new DiscordSimpleError(
        "Você não possui predileções bruxas, use o comando 'predBruxa atualizar' para criar seus predileções bruxas.",
      );

    await interaction.reply({
      embeds: [attributes.toEmbed()],
      ephemeral: true,
    });
    return;
  }

  @Command({
    name: 'atualizar',
    description: 'Atualiza os predileções bruxas do personagem',
  })
  async updateWitchPredilections(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
    @ArgInteger({
      name: WitchPredilectionDisplayEnum.ABJURATION,
      description: `${WitchPredilectionDisplayEnum.ABJURATION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    abjuration?: number,
    @ArgInteger({
      name: WitchPredilectionDisplayEnum.ENCHANTMENT,
      description: `${WitchPredilectionDisplayEnum.ENCHANTMENT}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    enchantment?: number,
    @ArgInteger({
      name: WitchPredilectionDisplayEnum.NECROMANCY,
      description: `${WitchPredilectionDisplayEnum.NECROMANCY}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    necromancy?: number,
    @ArgInteger({
      name: WitchPredilectionDisplayEnum.DIVINATION,
      description: `${WitchPredilectionDisplayEnum.DIVINATION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    divination?: number,
    @ArgInteger({
      name: WitchPredilectionDisplayEnum.EVOCATION,
      description: `${WitchPredilectionDisplayEnum.EVOCATION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    evocation?: number,
    @ArgInteger({
      name: WitchPredilectionDisplayEnum.TRANSMUTATION,
      description: `${WitchPredilectionDisplayEnum.TRANSMUTATION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    transmutation?: number,
    @ArgInteger({
      name: WitchPredilectionDisplayEnum.CONJURATION,
      description: `${WitchPredilectionDisplayEnum.CONJURATION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    conjuration?: number,
    @ArgInteger({
      name: WitchPredilectionDisplayEnum.ILLUSION,
      description: `${WitchPredilectionDisplayEnum.ILLUSION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    illusion?: number,
    @ArgInteger({
      name: WitchPredilectionDisplayEnum.UNIVERSAL,
      description: `${WitchPredilectionDisplayEnum.UNIVERSAL}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    universal?: number,
  ) {
    const witchPredilections = await this.service.updateOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
        abjuration,
        enchantment,
        necromancy,
        divination,
        evocation,
        transmutation,
        conjuration,
        illusion,
        universal,
      },
    );
    await interaction.reply({
      embeds: [witchPredilections.toEmbed()],
      ephemeral: true,
    });
    return;
  }
}
