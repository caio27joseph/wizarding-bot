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
import { WitchPredilectionNameEnum } from './entities/witch-predilection.entity';

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
      name: WitchPredilectionNameEnum.ABJURATION,
      description: `${WitchPredilectionNameEnum.ABJURATION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    abjuration?: number,
    @ArgInteger({
      name: WitchPredilectionNameEnum.ENCHANTMENT,
      description: `${WitchPredilectionNameEnum.ENCHANTMENT}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    enchantment?: number,
    @ArgInteger({
      name: WitchPredilectionNameEnum.NECROMANCY,
      description: `${WitchPredilectionNameEnum.NECROMANCY}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    necromancy?: number,
    @ArgInteger({
      name: WitchPredilectionNameEnum.DIVINATION,
      description: `${WitchPredilectionNameEnum.DIVINATION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    divination?: number,
    @ArgInteger({
      name: WitchPredilectionNameEnum.EVOCATION,
      description: `${WitchPredilectionNameEnum.EVOCATION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    evocation?: number,
    @ArgInteger({
      name: WitchPredilectionNameEnum.TRANSMUTATION,
      description: `${WitchPredilectionNameEnum.TRANSMUTATION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    transmutation?: number,
    @ArgInteger({
      name: WitchPredilectionNameEnum.CONJURATION,
      description: `${WitchPredilectionNameEnum.CONJURATION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    conjuration?: number,
    @ArgInteger({
      name: WitchPredilectionNameEnum.ILLUSION,
      description: `${WitchPredilectionNameEnum.ILLUSION}`,
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    illusion?: number,
    @ArgInteger({
      name: WitchPredilectionNameEnum.UNIVERSAL,
      description: `${WitchPredilectionNameEnum.UNIVERSAL}`,
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
