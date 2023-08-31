import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction } from 'discord.js';
import { NonConvPredilectionsService } from './noconv-predilections.service';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';
import { Injectable } from '@nestjs/common';
import { Command } from '~/discord/decorators/command.decorator';
import { NonConvPredilectionsDisplayEnum } from './entities/nonconv-predilections.entity';

@Group({
  name: 'pred_nc',
  description: 'Comandos relacionados a Predileções-Não-Convencionais',
})
@Injectable()
export class NonConvPredilectionsGroup {
  constructor(private readonly service: NonConvPredilectionsService) {}

  @Command({
    name: 'ver',
    description: 'Mostra os Predileções-Não-Convencionais do personagem',
  })
  async showNonConvPredilection(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
  ) {
    const nonConvPredilection = await this.service.findOne({
      where: { playerId: player.id },
    });
    if (!nonConvPredilection)
      throw new DiscordSimpleError(
        "Você não possui competencias, use o comando 'ncpred atualizar' para criar seus competencias.",
      );

    await interaction.reply({
      embeds: [nonConvPredilection.toEmbed()],
      ephemeral: true,
    });
    return;
  }

  @Command({
    name: 'atualizar',
    description: 'Atualiza os predilecoes nao convencionais do personagem',
  })
  async updateNonConvPredilection(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
    @ArgInteger({
      name: NonConvPredilectionsDisplayEnum.BROOMMANCY,
      description: `${NonConvPredilectionsDisplayEnum.BROOMMANCY} do personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    broommancy?: number,
    @ArgInteger({
      name: NonConvPredilectionsDisplayEnum.M_SELVAGEM,
      description: `${NonConvPredilectionsDisplayEnum.M_SELVAGEM} do personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    m_selvagem?: number,
    @ArgInteger({
      name: NonConvPredilectionsDisplayEnum.M_ANCESTRAL,
      description: `${NonConvPredilectionsDisplayEnum.M_ANCESTRAL} do personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    m_ancestral?: number,
    @ArgInteger({
      name: NonConvPredilectionsDisplayEnum.ELEMENTAL,
      description: `${NonConvPredilectionsDisplayEnum.ELEMENTAL} do personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    elemental?: number,
    @ArgInteger({
      name: NonConvPredilectionsDisplayEnum.ESPIRITUAL,
      description: `${NonConvPredilectionsDisplayEnum.ESPIRITUAL} do personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    espiritual?: number,
    @ArgInteger({
      name: NonConvPredilectionsDisplayEnum.M_MENTAL,
      description: `${NonConvPredilectionsDisplayEnum.M_MENTAL} do personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    m_mental?: number,
    @ArgInteger({
      name: NonConvPredilectionsDisplayEnum.M_AMORMENTE,
      description: `${NonConvPredilectionsDisplayEnum.M_AMORMENTE} do personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    m_amormente?: number,
    @ArgInteger({
      name: NonConvPredilectionsDisplayEnum.M_TEMPORAL,
      description: `${NonConvPredilectionsDisplayEnum.M_TEMPORAL} do personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    m_temporal?: number,
    @ArgInteger({
      name: NonConvPredilectionsDisplayEnum.WANDMANCY,
      description: `${NonConvPredilectionsDisplayEnum.WANDMANCY} do personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    wandmancy?: number,
  ) {
    const competences = await this.service.updateOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
        broommancy,
        m_selvagem,
        m_ancestral,
        elemental,
        espiritual,
        m_mental,
        m_amormente,
        m_temporal,
        wandmancy,
      },
    );
    await interaction.reply({
      embeds: [competences.toEmbed()],
      ephemeral: true,
    });
    return;
  }
}
