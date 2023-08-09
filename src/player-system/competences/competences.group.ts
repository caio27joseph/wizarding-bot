import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgInteraction,
  ArgPlayer,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction } from 'discord.js';
import { CompetencesService } from './competences.service';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';
import { Injectable } from '@nestjs/common';
import { Command } from '~/discord/decorators/command.decorator';

@Group({
  name: 'comp',
  description: 'Comandos relacionados a configuracao de competencias',
})
@Injectable()
export class CompetencesGroup {
  constructor(private readonly service: CompetencesService) {}

  @Command({
    name: 'ver',
    description: 'Mostra os competencias do personagem',
  })
  async showCompetences(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
  ) {
    const attributes = await this.service.findOne({
      where: { playerId: player.id },
    });
    if (!attributes)
      throw new DiscordSimpleError(
        "Você não possui competencias, use o comando 'compt atualizar' para criar seus competencias.",
      );

    await interaction.reply({
      embeds: [attributes.toEmbed()],
      ephemeral: true,
    });
    return;
  }

  // @Command({
  //   name: 'atualizar',
  //   description: 'Atualiza os competencias do personagem',
  // })
  // async updateCompetences(
  //   @ArgInteraction() interaction: CommandInteraction,
  //   @ArgPlayer() player: Player,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.APPARITION,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   apparition: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.MAGIZOOLOGY,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   magizoology: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.DARK_ARTS,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   dark_arts: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.FLIGHT,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   flight: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.DIVINATION,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   divination: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.ASTRONOMY,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   astronomy: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.ANCIENT_RUNES,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   ancient_runes: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.RITUALS,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   rituals: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.POTIONS_ALCHEMY,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   potions_alchemy: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.HERBOLOGY,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   herbology: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.MAGI_MEDICINE,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   magi_medicine: number,
  //   @ArgInteger({
  //     name: CompetencesNameEnum.MAGICAL_LANGUAGES,
  //     description: 'Força do personagem',
  //     required: false,
  //     choices: [1, 2, 3, 4, 5],
  //   })
  //   magical_languages: number,
  // ) {
  //   const competences = await this.service.updateOrCreate(
  //     {
  //       where: {
  //         playerId: player.id,
  //       },
  //     },
  //     {
  //       playerId: player.id,
  //       apparition,
  //       magizoology,
  //       dark_arts,
  //       flight,
  //       divination,
  //       astronomy,
  //       ancient_runes,
  //       rituals,
  //       potions_alchemy,
  //       herbology,
  //       magi_medicine,
  //       magical_languages,
  //     },
  //   );
  //   await interaction.reply({
  //     embeds: [competences.toEmbed()],
  //     ephemeral: true,
  //   });
  //   return;
  // }
}
