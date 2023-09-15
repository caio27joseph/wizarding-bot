import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { Group } from '~/discord/decorators/group.decorator';
import { ActionContext } from '~/discord/helpers/menu-helper';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgBoolean,
  ArgGuild,
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { Guild } from '~/core/guild/guild.entity';
import { Player } from '~/core/player/entities/player.entity';
import { SpellService } from './spell.service';
import { EntityNotFound } from '~/discord/exceptions';
import { ILike } from 'typeorm';
import {
  PageHelperOptions,
  PaginationHelper,
} from '~/discord/helpers/page-helper';
import {
  Spell,
  SpellCategoryNameEnum,
  SpellDifficultyEnum,
} from './entities/spell.entity';
import { Grimoire } from '~/grimoire/entities/grimoire.entity';
import { GrimoireService } from '~/grimoire/grimoire.service';
import { LearnService } from '~/evolution/learn/learn.service';

export interface SpellActionContext extends ActionContext {
  spell?: Spell;
  spells?: Spell[];
  grimoire?: Grimoire;
}

@Group({
  name: 'ftc',
  description: 'Menu de feitiço',
})
@Injectable()
export class SpellMenuGroup {
  constructor(
    private readonly spellService: SpellService,
    private readonly grimoireService: GrimoireService,
    private readonly learnService: LearnService,
  ) {}

  @Command({
    name: 'default',
    description: 'Menu de feitiço',
  })
  async spell(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgPlayer()
    player: Player,
    @ArgString({
      name: 'nome',
      description: 'Nome do feitiço',
      required: false,
    })
    name?: string,
    @ArgString({
      name: 'Escola Mágica',
      description: 'Competência do feitiço',
      required: false,
      choices: Object.values(SpellCategoryNameEnum),
    })
    category?: SpellCategoryNameEnum,
    @ArgString({
      name: 'dificuldade',
      description: 'Dificuldade do feitiço',
      required: false,
      choices: Object.values(SpellDifficultyEnum),
    })
    difficulty?: SpellDifficultyEnum,
    @ArgInteger({
      name: 'nível',
      description: 'Nível do feitiço',
      required: false,
    })
    level?: number,
    @ArgBoolean({
      name: 'Aprendendo',
      description: 'Filtrar por feitiços em aprendizado',
      required: false,
    })
    learning?: boolean,
    @ArgBoolean({
      name: 'Aprendidos',
      description: 'Filtrar por feitiços aprendidos',
      required: false,
    })
    learned?: boolean,
  ) {
    await interaction.deferReply({ ephemeral: true });
    const context: SpellActionContext = {
      guild,
      player,
      interaction,
    };
    if (!name)
      return await this.list(context, {
        difficulty,
        category,
        level,
        learning,
        learned,
      });
    const spell = await this.spellService.findOne({
      where: {
        name: ILike(name),
        guildId: guild.id,
      },
    });
    if (!spell) throw new EntityNotFound('Feitiço', name);
    context.spell = spell;
    await interaction.followUp({
      embeds: [spell.toEmbed()],
      ephemeral: true,
    });
  }
  async list(
    context: SpellActionContext,
    {
      difficulty,
      level,
      category,
      learning,
      learned,
    }: {
      difficulty?: SpellDifficultyEnum;
      level?: number;
      category?: SpellCategoryNameEnum;
      learning?: boolean;
      learned?: boolean;
    } = {},
  ) {
    let spells = await this.spellService.findAll({
      where: {
        guildId: context.guild.id,
        difficulty,
        level,
      },
      order: {
        level: 'ASC',
        name: 'ASC',
      },
    });
    if (category) {
      spells = spells.filter((s) => s.category.includes(category as string));
    }

    const grimoire = await this.grimoireService.findOne({
      where: {
        playerId: context.player.id,
        spells: {
          level,
          difficulty,
        },
      },
    });
    let grimoireSpells = grimoire?.spells || [];
    let learns = await this.learnService.findAll({
      where: {
        player: {
          id: context.player.id,
        },
        spell: {
          level,
          difficulty,
        },
      },
      relations: {
        spell: true,
      },
    });
    // check if not undefined
    if (learning !== undefined) {
      if (learning) {
        spells = learns.map((l) => l.spell);
      } else {
        spells = spells.filter((s) => !learns.some((l) => l.spell.id === s.id));
      }
    }
    if (learned !== undefined) {
      if (learned) {
        // Should exist in grimoire and not exist in learnings
        spells = grimoireSpells;
      } else {
        spells = spells.filter(
          (s) => !grimoireSpells.some((g) => g.id === s.id),
        );
      }
    }
    if (category) {
      grimoireSpells = grimoireSpells.filter((s) =>
        s.category.includes(category as string),
      );
      learns = learns.filter((l) =>
        l.spell.category.includes(category as string),
      );
    }

    const options: PageHelperOptions<Spell> = {
      itemsPerPage: 10,
      items: spells,
      header: `${spells.length} Feitiços Encontrados\n`,
      formatter: async (item, index, array) => {
        const grimoireSpell = grimoireSpells.some((s) => s.id === item.id);
        const learn = learns.find((l) => l.spell.id === item.id);

        const status = learn
          ? learn.progress >= item.necessaryLearns
            ? `✳️ - ${learn.progress}/${item.necessaryLearns}`
            : `${learn?.progress}/${item.necessaryLearns}`
          : grimoireSpell
          ? '✅'
          : '❌';
        return (
          `### ${item.name} ${status}` +
          `\n` +
          `Nível: ${item.level} - ${item.category.join(', ')} / ${
            item.difficulty
          }` +
          (item.requirements ? `\nRequisitos: ${item.requirements}` : '')
        );
      },
      footer(currentPage, totalPages) {
        return (
          '\n' +
          '```\n✳️ - Estudado (-1 na rolagem)\n' +
          '✅ - No grimório\n' +
          '❌ - Não aprendido\n```' +
          `Página ${currentPage} de ${totalPages}`
        );
      },
    };
    await new PaginationHelper(options).followUp(context.interaction);
  }
}
