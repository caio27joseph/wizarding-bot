import { Injectable } from '@nestjs/common';
import {
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  Interaction,
  InteractionReplyOptions,
  Message,
} from 'discord.js';
import { Player } from '~/core/player/entities/player.entity';
import { PlayerService } from '~/core/player/player.service';
import {
  DiscordSimpleError,
  EntityAlreadyExists,
  EntityNotFound,
} from '~/discord/exceptions';
import {
  ActionContext,
  MenuAction,
  MenuHelper,
} from '~/discord/helpers/menu-helper';
import {
  PageHelperOptions,
  PaginationHelper,
} from '~/discord/helpers/page-helper';
import { Spell, SpellDifficultyEnum } from '~/spell/entities/spell.entity';
import { SpellService } from '~/spell/spell.service';
import { Grimoire } from './entities/grimoire.entity';
import { GrimoireService } from './grimoire.service';
import {
  FormConfig,
  FormHelper,
  OptionConfig,
} from '~/discord/helpers/form-helper';
import { Group } from '~/discord/decorators/group.decorator';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgGuild,
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { Guild } from '~/core/guild/guild.entity';
import { ILike } from 'typeorm';
import { TrainSpellService } from '~/train/train-spell.service';
import { groupBy } from 'lodash';
import { generateProgressBarEmoji } from '~/utils/emojiProgressBar';
import { SpellActionContext } from '~/spell/spell.menu.group';
import {
  witchPredilectionChoices,
  witchPredilectionKeyToDisplayMap,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';

interface Props {
  selectedSlot: number;
}

export interface HandleGrimoireActionOptions {
  interaction: CommandInteraction;
}

export interface GrimoireActionContext extends SpellActionContext {
  grimoire: Grimoire;
}

@Group({
  name: 'grimorio',
  description: 'Gerencia o grimório do jogador',
})
@Injectable()
export class GrimoireMenu {
  constructor(
    private readonly grimoireService: GrimoireService,
    private readonly spellService: SpellService,
    private readonly trainSpellService: TrainSpellService,
  ) {}

  @Command({
    name: 'aprender',
    description: 'Aprende um feitiço adicionando ele ao grimório',
  })
  async learnSpell(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'feitico',
      description: 'Nome do feitiço',
    })
    name: string,
  ) {
    await interaction.deferReply({ ephemeral: true });
    const spell = await this.spellService.findOne({
      where: {
        guildId: guild.id,
        name: ILike(name),
      },
    });
    const grimoire = await this.grimoireService.getOrCreate(
      {
        where: {
          playerId: player.id,
        },
        relations: {
          spells: true,
        },
      },
      {
        player: player,
        playerId: player.id,
      },
    );
    if (grimoire.spells.some((s) => s.id === spell.id)) {
      return await interaction.followUp({
        content: `Você já conhece o feitiço ${spell.name}`,
        embeds: [spell.toShortEmbed()],
      });
    }
    grimoire.spells.push(spell);
    await this.grimoireService.save(grimoire);
    await interaction.followUp({
      content: `Você aprendeu o feitiço ${spell.name}`,
      embeds: [spell.toShortEmbed()],
    });
  }

  @Command({
    name: '_add',
    description: 'Adiciona o Feitiço a algum jogador',
    mod: true,
  })
  async teachSpell(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer({
      name: 'Jogador',
      description: 'Jogador que será ensinado',
    })
    player: Player,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'feitico',
      description: 'Nome do feitiço',
    })
    name: string,
  ) {
    return await this.learnSpell(interaction, player, guild, name);
  }

  @Command({
    name: 'desaprender',
    description: 'Desaprende o feitiço anteriormente adicionado ao grimório',
  })
  async unlearnGrimoire(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'nome',
      description: 'Nome do feitiço',
    })
    name: string,
  ) {
    const spell = await this.spellService.findOne({
      where: {
        guildId: guild.id,
        name: ILike(name),
      },
    });
    const grimoire = await this.grimoireService.getOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        playerId: player.id,
      },
    );
    grimoire.spells = grimoire.spells.filter((s) => s.id !== spell.id);
    await this.grimoireService.save(grimoire);
  }

  @Command({
    name: '_rem',
    description: 'Remove o Feitiço de algum jogador',
    mod: true,
  })
  async removeGrimoire(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer({
      name: 'Jogador',
      description: 'Jogador que perderá o feitiço',
    })
    player: Player,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'Feitiço',
      description: 'Nome do feitiço',
    })
    name: string,
  ) {
    return await this.unlearnGrimoire(interaction, player, guild, name);
  }

  @Command({
    name: 'listar',
    description: 'Ver o grimório do jogador',
  })
  async listGrimoire(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgGuild()
    guild: Guild,
    @ArgInteger({
      name: 'Nivel_Feitico',
      description: 'Nível do feitiço',
      required: false,
    })
    level?: number,
    @ArgString({
      name: 'Escola_Magica',
      description: 'Escola do feitiço',
      required: false,
      choices: Object.entries(witchPredilectionKeyToDisplayMap).map(
        ([key, value]) => ({
          name: value,
          value: key,
        }),
      ),
    })
    category?: string,
    @ArgString({
      name: 'Dificuldade_Feitico',
      description: 'Dificuldade do feitiço',
      required: false,
    })
    difficulty?: SpellDifficultyEnum,
  ) {
    await interaction.deferReply({ ephemeral: true });
    const grimoire = await this.grimoireService.getOrCreate(
      {
        where: {
          playerId: player.id,
          spells: {
            level,
            difficulty,
          },
        },
        relations: {
          spells: true,
        },
      },
      {
        playerId: player.id,
      },
    );
    const spells = grimoire.spells.filter((spell) => {
      if (category && !spell.category.includes(category)) {
        return false;
      }
      return true;
    });

    const trains = await this.trainSpellService.playerTrains(player.id);

    const groupedTrains = groupBy(trains, (train) => train.spellId);

    const options: PageHelperOptions<Spell> = {
      items: spells || [],
      header: `# Grimório de ${player?.name}\n${spells.length} Feitiços Encontrados\n`,
      formatter: async (item, index, array) => {
        const progress = await this.trainSpellService.progressData({
          spell: item,
          trains: groupedTrains[item.id] || [],
        });

        let message = `## ${index}. **${item.name}**\n`;
        message += `Nível: ${
          progress.currentLevel
        } - ${generateProgressBarEmoji(
          progress.xpTowardsNextLevel,
          progress.necessaryXP,
        )} ${progress.xpTowardsNextLevel}/${progress.necessaryXP}`;
        return message;
      },
      footer(currentPage, totalPages) {
        return `\nPágina ${currentPage} de ${totalPages}`;
      },
    };
    new PaginationHelper(options).followUp(interaction);
  }
}
