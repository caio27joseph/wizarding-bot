import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction } from 'discord.js';
import { CompetencesService } from './competences.service';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';
import { Injectable } from '@nestjs/common';
import { Command } from '~/discord/decorators/command.decorator';
import { CompetenceDisplayEnum } from './entities/competences.entity';

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

  @Command({
    name: 'atualizar',
    description: 'Atualiza os competencias do personagem',
  })
  async updateCompetences(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
    @ArgInteger({
      name: CompetenceDisplayEnum.APPARITION,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    apparition: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.MAGIZOOLOGY,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    magizoology: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.DARK_ARTS,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    dark_arts: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.FLIGHT,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    flight: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.DIVINATION,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    divination: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.ASTRONOMY,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    astronomy: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.ANCIENT_RUNES,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    ancient_runes: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.RITUALS,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    rituals: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.POTIONS_ALCHEMY,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    potions_alchemy: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.HERBOLOGY,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    herbology: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.MAGI_MEDICINE,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    magi_medicine: number,
    @ArgInteger({
      name: CompetenceDisplayEnum.MAGICAL_LANGUAGES,
      description: 'Força do personagem',
      required: false,
      choices: [1, 2, 3, 4, 5],
    })
    magical_languages: number,
  ) {
    const competences = await this.service.updateOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
        apparition,
        magizoology,
        dark_arts,
        flight,
        divination,
        astronomy,
        ancient_runes,
        rituals,
        potions_alchemy,
        herbology,
        magi_medicine,
        magical_languages,
      },
    );
    await interaction.reply({
      embeds: [competences.toEmbed()],
      ephemeral: true,
    });
    return;
  }
}
