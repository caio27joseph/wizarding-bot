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
import {
  AttributeKeyType,
  attributeChoices,
} from '~/player-system/attribute/entities/attributes.entity';
import { Player } from '~/core/player/entities/player.entity';

import {
  MagicSchoolKeys,
  MagicSchoolPtBr,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { nonConvPredilectionsChoices } from '~/player-system/nonconv-predilection/entities/nonconv-predilections.entity';
import { extrasChoices } from '~/player-system/extras/entities/extras.entity';
import { RollService } from './roll.service';
import {
  AbilitiesKeys,
  abilitiesKeyToDisplayMap,
} from '~/player-system/abilities/entities/abilities.entity';

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
    attribute?: AttributeKeyType,
    @ArgString({
      name: 'hab1',
      description: 'Perícia a ser rolada',
      choices: Object.entries(abilitiesKeyToDisplayMap)
        .slice(0, 12)
        .map(([key, value]) => ({
          name: value,
          value: key,
        })),

      required: false,
    })
    hab1?: AbilitiesKeys,
    @ArgString({
      name: 'hab2',
      description: 'Perícia a ser rolada',
      choices: Object.entries(abilitiesKeyToDisplayMap)
        .slice(12, 24)
        .map(([key, value]) => ({
          name: value,
          value: key,
        })),
      required: false,
    })
    hab2?: AbilitiesKeys,
    @ArgString({
      name: 'hab3',
      description: 'Perícia a ser rolada',
      choices: Object.entries(abilitiesKeyToDisplayMap)
        .slice(24, 36)
        .map(([key, value]) => ({
          name: value,
          value: key,
        })),
      required: false,
    })
    hab3?: AbilitiesKeys,
    @ArgString({
      name: 'Escola Mágica',
      description: 'Escola Mágica a ser rolada',
      choices: Object.entries(MagicSchoolPtBr).map(([key, value]) => ({
        name: value,
        value: key,
      })),
      required: false,
    })
    magicSchool?: MagicSchoolKeys,
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
    @ArgInteger({
      name: 'Meta',
      description: 'Meta de sucesso',
      required: false,
    })
    meta?: number,
  ) {
    await interaction.deferReply();
    const roll = await this.rollService.roll10(interaction, player, {
      diff,
      autoSuccess,
      bonus,
      attribute,
      hab1,
      hab2,
      hab3,
      magicSchool,
      nonConvPredilectionsChoices,
      extras,
      message,
      meta,
    });

    await interaction.editReply({
      embeds: [roll.toEmbed()],
    });
  }
}
