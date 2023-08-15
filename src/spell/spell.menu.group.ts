import { Injectable } from '@nestjs/common';
import {
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
import { SpellActionContext } from './spell.group';
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
  SpellCategoryEnum,
  SpellDifficultyEnum,
} from './entities/spell.entity';
import { GrimoireMenu } from '~/grimoire/grimoire.menu';

@Group({
  name: 'ftc',
  description: 'Menu de feitiço',
})
@Injectable()
export class SpellMenuGroup extends MenuHelper<SpellActionContext> {
  constructor(
    private readonly spellService: SpellService,
    private readonly trainMenu: TrainSpellMenu,
    private readonly grimoireMenu: GrimoireMenu,
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
    i: CommandInteraction,
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
      choices: Object.values(SpellCategoryEnum),
    })
    category?: SpellCategoryEnum,
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
    const context: SpellActionContext = {
      guild,
      player,
      interaction: i,
      i,
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

    await this.handle(context);
  }
  async list(context: SpellActionContext, where: FindOptionsWhere<Spell> = {}) {
    let spells = await this.spellService.findAll({
      where: {
        guildId: context.guild.id,
        difficulty: where.difficulty,
        level: where.level,
      },
    });
    if (where.category) {
      spells = spells.filter((s) =>
        s.category.includes(where.category as string),
      );
    }
    const options: PageHelperOptions<Spell> = {
      itemsPerPage: 10,
      items: spells,
      header: 'Feitiços\n',
      formatter: async (item, index, array) => {
        return item.toShortText(index);
      },
      footer(currentPage, totalPages) {
        return `Página ${currentPage} de ${totalPages}`;
      },
    };
    await new PaginationHelper(options).reply(context.interaction);
  }

  @MenuAction('Maestria')
  async train(context: SpellActionContext) {
    await this.trainMenu.handle(context);
  }

  @MenuAction('Grimório')
  async grimoire(context: SpellActionContext) {
    await this.grimoireMenu.handle(context);
  }
}
