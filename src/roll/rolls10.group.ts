import { Injectable } from '@nestjs/common';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import { RollsD10 } from './entities/roll.entity';
import {
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction } from 'discord.js';
import { attributeChoices } from '~/player-system/attribute/entities/attributes.entity';
import { Player } from '~/core/player/entities/player.entity';
import { AttributeService } from '~/player-system/attribute/attribute.service';
import { AbilitiesService } from '~/player-system/abilities/abilities.service';
import { CompetencesService } from '~/player-system/competences/competences.service';
import { WitchPredilectionsService } from '~/player-system/witch-predilection/witch-predilection.service';
import { NonConvPredilectionsService } from '~/player-system/nonconv-predilection/noconv-predilections.service';
import { competenceChoices } from '~/player-system/competences/entities/competences.entity';
import {
  Abilities,
  knowledgeChoices,
  skillChoices,
  talentChoices,
} from '~/player-system/abilities/entities/abilities.entity';
import { witchPredilectionsChoices } from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { nonConvPredilectionsChoices } from '~/player-system/nonconv-predilection/entities/nonconv-predilections.entity';

@Group({
  name: 'dr',
  description: 'Rola dados podendo informar diretamente nome dos campos',
})
@Injectable()
export class Rolls10Group {
  constructor(
    private readonly attributesService: AttributeService,
    private readonly abilitiesService: AbilitiesService,
    private readonly competencesService: CompetencesService,
    private readonly witchPredilectionsService: WitchPredilectionsService,
    private readonly nonConvPredilectionsService: NonConvPredilectionsService,
  ) {}

  @Command({
    name: 'default',
  })
  async roll(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgInteger({
      name: 'Bônus',
      description: 'Bônus a ser adicionado ao rolamento',
      required: false,
    })
    bonus?: number,
    @ArgInteger({
      name: 'Automático',
      description: 'Sucessos automáticos a ser adicionado ao rolamento',
      required: false,
    })
    autoSuccess?: number,
    @ArgInteger({
      name: 'Dificuldade',
      description: 'Dificuldade do rolamento',
      required: false,
    })
    diff?: number,
    @ArgString({
      name: 'Atributo',
      description: 'Atributo a ser rolado',
      choices: attributeChoices,
      required: false,
    })
    attribute?: string,
    @ArgString({
      name: 'Perícia',
      description: 'Perícia a ser rolada',
      choices: skillChoices,
      required: false,
    })
    skills?: string,
    @ArgString({
      name: 'Talento',
      description: 'Talento a ser rolado',
      choices: talentChoices,
      required: false,
    })
    talent?: string,
    @ArgString({
      name: 'Conhecimento',
      description: 'Conhecimento a ser rolado',
      choices: knowledgeChoices,
      required: false,
    })
    knowledge?: string,
    @ArgString({
      name: 'Competência',
      description: 'Competencia a ser rolada',
      choices: competenceChoices,
      required: false,
    })
    competence?: string,
    @ArgString({
      name: 'Predileção Bruxa',
      description: 'Predileção a ser rolada',
      choices: witchPredilectionsChoices,
      required: false,
    })
    witchPredilection?: string,
    @ArgString({
      name: 'Predileção Não Convencional',
      description: 'Predileção a ser rolada',
      choices: nonConvPredilectionsChoices,
      required: false,
    })
    nonConvPredilectionsChoices?: string,
  ) {
    let dices = 0;
    let expression = '';
    if (attribute) {
      const attributes = await this.attributesService.findOne({
        where: {
          playerId: player.id,
        },
      });
      const value = attributes[attribute];
      dices += value;
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    let abilities: Abilities;
    if (skills || talent || knowledge) {
      abilities = await this.abilitiesService.findOne({
        where: {
          playerId: player.id,
        },
      });
    }
    if (skills) {
      const value = abilities[skills];
      dices += value;
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    if (talent) {
      const value = abilities[talent];
      dices += value;
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    if (knowledge) {
      const value = abilities[knowledge];
      dices += value;
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    if (competence) {
      const competences = await this.competencesService.findOne({
        where: {
          playerId: player.id,
        },
      });
      const value = competences[competence];
      dices += value;
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    if (witchPredilection) {
      const witchPredilections = await this.witchPredilectionsService.findOne({
        where: {
          playerId: player.id,
        },
      });
      const value = witchPredilections[witchPredilection];
      dices += value;
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    if (nonConvPredilectionsChoices) {
      const nonConvPredilections =
        await this.nonConvPredilectionsService.findOne({
          where: {
            playerId: player.id,
          },
        });
      const value = nonConvPredilections[nonConvPredilectionsChoices];
      dices += value;
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    if (bonus) {
      dices += bonus;
      if (expression.length > 0) expression += ' + ';
      expression += `${bonus}`;
    }
    if (dices + (autoSuccess || 0) <= 0) {
      await interaction.reply({
        content: `${interaction.member} - FALHA AUTOMATICA - ${
          expression || 0
        }`,
      });
      return;
    }

    const roll = new RollsD10(dices, diff || 6, autoSuccess || 0);

    await interaction.reply({
      content: `${interaction.member}`,
      embeds: [
        roll.toEmbed().setFooter({
          text: `${expression} = ${dices}d10, diff: ${diff || 6}`,
        }),
      ],
    });
  }
}
