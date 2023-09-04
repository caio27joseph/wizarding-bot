import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
} from '~/discord/decorators/message.decorators';
import { CommandInteraction } from 'discord.js';

import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';
import { AbilitiesService } from './abilities.service';
import {
  AbilitiesDisplayEnum,
  AbilitiesKeyEnum,
  abilitiesKeyToDisplayMap,
} from './entities/abilities.entity';
import { Injectable } from '@nestjs/common';

@Group({
  name: 'hab',
  description: 'Comandos relacionados a configuracao de pericias',
})
@Injectable()
export class AbilitiesGroup {
  constructor(private readonly service: AbilitiesService) {}

  @Command({
    name: 'ver',
    description: 'Mostra os habilidades do personagem',
  })
  async showAbilities(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
  ) {
    const abiliites = await this.service.findOne({
      where: { playerId: player.id },
    });
    if (!abiliites)
      throw new DiscordSimpleError(
        "Você não possui habilidades, use o comando 'pericias/talentos/conhecimentos atualizar' para criar suas habilidades.",
      );

    await interaction.reply({
      embeds: [abiliites.toEmbed()],
      ephemeral: true,
    });
    return;
  }
}

@Group({
  name: 'hab1',
  description: 'Comandos relacionados a configuracao de pericias',
})
@Injectable()
export class Abiliites1Group {
  constructor(private readonly service: AbilitiesService) {}
  @Command({
    name: 'atualizar',
    description: 'Atualiza as habilidades do personagem',
  })
  async updateAbilities(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.ACADEMICS],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    academics?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.BLADED_WEAPONS],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    bladed_weapons?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.DARK_ARTS],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    dark_arts?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.ATHLETICS],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    athletics?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.FIGHT],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    fight?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.THEOLOGICAL_KNOWLEDGE],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    theological_knowledge?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.SCIENCES],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    sciences?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.DRIVING],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    driving?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.COSMOLOGY],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    cosmology?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.EMPATHY],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    empathy?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.DODGE],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    dodge?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.ETIQUETTE],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    etiquette?: number,
  ) {
    const abiliites = await this.service.updateOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
        academics,
        bladed_weapons,
        dark_arts,
        athletics,
        fight,
        theological_knowledge,
        sciences,
        driving,
        cosmology,
        empathy,
        dodge,
        etiquette,
      },
    );
    await interaction.reply({
      embeds: [abiliites.toEmbed()],
      ephemeral: true,
    });
    return;
  }
}

@Group({
  name: 'hab2',
  description: 'Comandos relacionados a configuracao de pericias',
})
@Injectable()
export class Abiliites2Group {
  constructor(private readonly service: AbilitiesService) {}
  @Command({
    name: 'atualizar',
    description: 'Atualiza as habilidades do personagem',
  })
  async updateAbilities(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.EXPRESSION],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    expression?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.FINANCES],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    finances?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.STEALTH],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    stealth?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.HERBOLOGY],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    herbology?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.INTIMIDATION],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    intimidation?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.INTUITION],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    intuition?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.INVESTIGATION],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    investigation?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.BLARNEY],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    blarney?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.LEADERSHIP],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    leadership?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.LINGUISTICS],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    linguistics?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.CUNNING],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    cunning?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.MEDICINE],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    medicine?: number,
  ) {
    const abiliites = await this.service.updateOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
        expression,
        finances,
        stealth,
        herbology,
        intimidation,
        intuition,
        investigation,
        blarney,
        leadership,
        linguistics,
        cunning,
        medicine,
      },
    );
    await interaction.reply({
      embeds: [abiliites.toEmbed()],
      ephemeral: true,
    });
    return;
  }
}

@Group({
  name: 'hab3',
  description: 'Comandos relacionados a configuracao de pericias',
})
@Injectable()
export class Abiliites3Group {
  constructor(private readonly service: AbilitiesService) {}
  @Command({
    name: 'atualizar',
    description: 'Atualiza as habilidades do personagem',
  })
  async updateAbilities(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.MEDITATION],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    meditation?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.OCCULTISM],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    occultism?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.CRAFTS],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    crafts?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.PERCEPTION],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    perception?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.PERFORMANCE],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    performance?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.PERSUASION],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    persuasion?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.POLITICS],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    politics?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.AIM],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    aim?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.POTIONS_ALCHEMY],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    potions_alchemy?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.THEFT],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    theft?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.SURVIVAL],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    survival?: number,
    @ArgInteger({
      name: abilitiesKeyToDisplayMap[AbilitiesKeyEnum.ANIMAL_HANDLING],
      description: 'Valor a se adicionar',
      choices: [0, 1, 2, 3, 4, 5],
      required: false,
    })
    animal_handling?: number,
  ) {
    const abiliites = await this.service.updateOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
        meditation,
        occultism,
        crafts,
        perception,
        performance,
        persuasion,
        politics,
        aim,
        potions_alchemy,
        theft,
        survival,
        animal_handling,
      },
    );
    await interaction.reply({
      embeds: [abiliites.toEmbed()],
      ephemeral: true,
    });
    return;
  }
}
