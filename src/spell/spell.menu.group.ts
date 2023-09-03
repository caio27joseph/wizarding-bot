import { Injectable } from '@nestjs/common';
import {
  ButtonInteraction,
  CommandInteraction,
  Interaction,
  InteractionReplyOptions,
} from 'discord.js';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ActionContext,
  MenuAction,
  MenuHelper,
} from '~/discord/helpers/menu-helper';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgGuild,
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { Guild } from '~/core/guild/guild.entity';
import { Player } from '~/core/player/entities/player.entity';
import { SpellService } from './spell.service';
import { EntityAlreadyExists, EntityNotFound } from '~/discord/exceptions';
import { TrainSpellMenu } from '~/train/train-spell.menu';
import { FindOptionsWhere, ILike } from 'typeorm';
import {
  PageHelperOptions,
  PaginationHelper,
} from '~/discord/helpers/page-helper';
import {
  Spell,
  SpellCategoryNameEnum,
  SpellDifficultyEnum,
} from './entities/spell.entity';
import { GrimoireMenu } from '~/grimoire/grimoire.menu';
import { Grimoire } from '~/grimoire/entities/grimoire.entity';
import { GrimoireService } from '~/grimoire/grimoire.service';

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
export class SpellMenuGroup extends MenuHelper<SpellActionContext> {
  constructor(
    private readonly spellService: SpellService,
    private readonly trainMenu: TrainSpellMenu,
    private readonly grimoireService: GrimoireService,
  ) {
    super();
  }

  buildUpContext(context: unknown): SpellActionContext {
    return context as any;
  }
  getMenuPrompt(context: SpellActionContext): InteractionReplyOptions {
    const message: InteractionReplyOptions = {
      embeds: [context.spell.toEmbed()],
      ephemeral: true,
    };
    return message;
  }

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
      name: 'Competência',
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
      });
    const spell = await this.spellService.findOne({
      where: {
        name: ILike(name),
        guildId: guild.id,
      },
    });
    if (!spell) throw new EntityNotFound('Feitiço', name);
    context.spell = spell;

    await this.handle(context, true);
  }
  async list(
    context: SpellActionContext,
    { difficulty, level, category }: FindOptionsWhere<Spell> = {},
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
    if (category) {
      grimoireSpells = grimoireSpells.filter((s) =>
        s.category.includes(category as string),
      );
    }

    const options: PageHelperOptions<Spell> = {
      itemsPerPage: 10,
      items: spells,
      header: 'Feitiços\n',
      formatter: async (item, index, array) => {
        const grimoireSpell = grimoireSpells.some((s) => s.id === item.id);
        return (
          `### ${item.name} ${grimoire && grimoireSpell ? `✅` : `❌`}` +
          `\n` +
          `Nível: ${item.level} - ${item.category.join(', ')} / ${
            item.difficulty
          }` +
          (item.requirements ? `\nRequisitos: ${item.requirements}` : '')
        );
      },
      footer(currentPage, totalPages) {
        return `\nPágina ${currentPage} de ${totalPages}`;
      },
    };
    await new PaginationHelper(options).followUp(context.interaction);
  }

  @MenuAction('Maestria')
  async train(context: SpellActionContext, i: ButtonInteraction) {
    await this.trainMenu.handle(context);
  }
}
