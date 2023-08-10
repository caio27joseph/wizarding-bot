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
import { AbilitiesNameEnum } from './entities/abilities.entity';
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
  name: 'pericias',
  description: 'Comandos relacionados a configuracao de pericias',
})
@Injectable()
export class AbiliitesSkillsGroup {
  constructor(private readonly service: AbilitiesService) {}
  @Command({
    name: 'atualizar',
    description: 'Atualiza as habilidades do personagem',
  })
  async updateAbilities(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,

    @ArgInteger({
      name: AbilitiesNameEnum.BLADED_WEAPONS,
      description: `${AbilitiesNameEnum.BLADED_WEAPONS} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    bladed_weapons?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.ATHLETICS,
      description: `${AbilitiesNameEnum.ATHLETICS} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    athletics?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.FIGHT,
      description: `${AbilitiesNameEnum.FIGHT} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    fight?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.DRIVING,
      description: `${AbilitiesNameEnum.DRIVING} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    driving?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.MAGIC_DUEL,
      description: `${AbilitiesNameEnum.MAGIC_DUEL} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    magic_duel?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.DODGE,
      description: `${AbilitiesNameEnum.DODGE} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    dodge?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.STEALTH,
      description: `${AbilitiesNameEnum.STEALTH} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    stealth?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.CRAFTS,
      description: `${AbilitiesNameEnum.CRAFTS} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    crafts?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.AIM,
      description: `${AbilitiesNameEnum.AIM} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    aim?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.PERCEPTION,
      description: `${AbilitiesNameEnum.PERCEPTION} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    perception?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.THEFT,
      description: `${AbilitiesNameEnum.THEFT} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    theft?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.SURVIVAL,
      description: `${AbilitiesNameEnum.SURVIVAL} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    survival?: number,
  ) {
    const abiliites = await this.service.updateOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
        bladed_weapons,
        athletics,
        fight,
        driving,
        magic_duel,
        dodge,
        stealth,
        crafts,
        aim,
        perception,
        theft,
        survival,
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
  name: 'talentos',
  description: 'Comandos relacionados a configuracao de pericias',
})
@Injectable()
export class AbiliitesTalentsGroup {
  constructor(private readonly service: AbilitiesService) {}
  @Command({
    name: 'atualizar',
    description: 'Atualiza as habilidades do personagem',
  })
  async updateAbilities(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
    @ArgInteger({
      name: AbilitiesNameEnum.EXPRESSION,
      description: `${AbilitiesNameEnum.EXPRESSION} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    expression?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.EMPATHY,
      description: `${AbilitiesNameEnum.EMPATHY} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    empathy?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.ETIQUETTE,
      description: `${AbilitiesNameEnum.ETIQUETTE} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    etiquette?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.INTIMIDATION,
      description: `${AbilitiesNameEnum.INTIMIDATION} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    intimidation?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.INTUITION,
      description: `${AbilitiesNameEnum.INTUITION} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    intuition?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.SWEET_TALK,
      description: `${AbilitiesNameEnum.SWEET_TALK} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    sweet_talk?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.LEADERSHIP,
      description: `${AbilitiesNameEnum.LEADERSHIP} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    leadership?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.CUNNING,
      description: `${AbilitiesNameEnum.CUNNING} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    cunning?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.PERFORMANCE,
      description: `${AbilitiesNameEnum.PERFORMANCE} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    performance?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.PERSUASION,
      description: `${AbilitiesNameEnum.PERSUASION} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    persuasion?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.SLEIGHT_OF_HAND,
      description: `${AbilitiesNameEnum.SLEIGHT_OF_HAND} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    sleight_of_hand?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.ANIMAL_HANDLING,
      description: `${AbilitiesNameEnum.ANIMAL_HANDLING} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
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
        expression,
        empathy,
        etiquette,
        intimidation,
        intuition,
        sweet_talk,
        leadership,
        cunning,
        performance,
        persuasion,
        sleight_of_hand,
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
@Group({
  name: 'conhecimentos',
  description: 'Comandos relacionados a configuracao de pericias',
})
@Injectable()
export class AbiliitesKnowledgesGroup {
  constructor(private readonly service: AbilitiesService) {}

  @Command({
    name: 'atualizar',
    description: 'Atualiza as habilidades do personagem',
  })
  async updateAbilities(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,

    @ArgInteger({
      name: AbilitiesNameEnum.ACADEMICS,
      description: `${AbilitiesNameEnum.ACADEMICS} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    academics?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.SCIENCES,
      description: `${AbilitiesNameEnum.SCIENCES} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    sciences?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.COSMOLOGY,
      description: `${AbilitiesNameEnum.COSMOLOGY} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    cosmology?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.TECHNOLOGY,
      description: `${AbilitiesNameEnum.TECHNOLOGY} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    technology?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.FINANCES,
      description: `${AbilitiesNameEnum.FINANCES} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    finances?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.INVESTIGATION,
      description: `${AbilitiesNameEnum.INVESTIGATION} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    investigation?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.LINGUISTICS,
      description: `${AbilitiesNameEnum.LINGUISTICS} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    linguistics?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.MEDITATION,
      description: `${AbilitiesNameEnum.MEDITATION} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    meditation?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.MEDICINE,
      description: `${AbilitiesNameEnum.MEDICINE} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    medicine?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.OCCULTISM,
      description: `${AbilitiesNameEnum.OCCULTISM} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    occultism?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.POLITICS,
      description: `${AbilitiesNameEnum.POLITICS} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    politics?: number,
    @ArgInteger({
      name: AbilitiesNameEnum.THEOLOGICAL_KNOWLEDGE,
      description: `${AbilitiesNameEnum.THEOLOGICAL_KNOWLEDGE} do Personagem`,
      required: false,
      choices: [0, 1, 2, 3, 4, 5],
    })
    theological_knowledge?: number,
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
        sciences,
        cosmology,
        technology,
        finances,
        investigation,
        linguistics,
        meditation,
        medicine,
        occultism,
        politics,
        theological_knowledge,
      },
    );
    await interaction.reply({
      embeds: [abiliites.toEmbed()],
      ephemeral: true,
    });
    return;
  }
}
