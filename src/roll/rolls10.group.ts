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
import { ExtrasService } from '~/player-system/extras/extras.service';
import { extrasChoices } from '~/player-system/extras/entities/extras.entity';
import { RollService } from './roll.service';

@Group({
  name: 'dr',
  description: 'Rola dados podendo informar diretamente nome dos campos',
})
@Injectable()
export class Rolls10Group {
  constructor(private readonly rollService: RollService) {}

  @Command({
    name: 'default',
  })
  async roll(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgString({
      name: 'Mensagem',
      description: 'Enviar uma mensagem junto com o dado',
      required: false,
    })
    message?: string,
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
    @ArgString({
      name: 'Extras',
      description: 'Extras a ser rolado',
      required: false,
      choices: extrasChoices,
    })
    extras?: string,
  ) {
    const roll = await this.rollService.roll10(player, {
      diff,
      autoSuccess,
      bonus,
      attribute,
      skills,
      talent,
      knowledge,
      competence,
      witchPredilection,
      nonConvPredilectionsChoices,
      extras,
      message,
    });

    await interaction.reply({
      content: `${interaction.member}`,
      embeds: [roll.toEmbed()],
    });
  }
}
