import { Injectable } from '@nestjs/common';
import {
  ButtonStyle,
  CommandInteraction,
  InteractionReplyOptions,
  MessageReplyOptions,
} from 'discord.js';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgGuild,
  ArgInteraction,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { WandWoodService } from './wand-wood.service';
import { Like } from 'typeorm';
import {
  ActionContext,
  MenuAction,
  MenuHelper,
} from '~/discord/helpers/menu-helper';
import { WandWood } from './entities/wand-wood.entity';
import { Guild } from '~/core/guild/guild.entity';
import { BonusMenuHelper } from '../bonuses/bonus-menu.helper';
import { WandCoreService } from './wand-core.service';
import { WandCore } from './entities/wand-core.entity';

interface SelectWoodContext extends ActionContext {
  wood: WandWood;
}

interface SelectCoreContext extends ActionContext {
  core: WandCore;
}

@Injectable()
export class ModWandWoodMenu extends MenuHelper<SelectWoodContext> {
  constructor(private readonly woodService: WandWoodService) {
    super();
  }
  buildUpContext(context: ActionContext) {
    return context as SelectWoodContext;
  }
  getMenuPrompt(context: SelectWoodContext): InteractionReplyOptions {
    const { wood } = context;
    return wood.toReply();
  }

  @MenuAction('Adicionar Bônus')
  async addBonus(context: SelectWoodContext) {
    const { interaction, wood } = context;
    await interaction.editReply({
      content: 'Adicionar Bônus',
      embeds: [],
    });
    await BonusMenuHelper.addBonus(context, async (i, bonus) => {
      wood.bonuses.push(bonus);
      await this.woodService.save(wood);
      await this.handle(context);
    });
  }

  @MenuAction('Remover Bônus')
  async removeBonus(context: SelectWoodContext) {
    const { interaction, wood } = context;
    await interaction.editReply({
      content: 'Remover Bônus',
      embeds: [],
    });
    await BonusMenuHelper.removeBonus(
      context,
      async (i, bonus) => {
        wood.bonuses = wood.bonuses.filter((b) => b.id !== bonus.id);
        await this.woodService.save(wood);
        await this.handle(context);
      },
      wood.bonuses,
    );
  }
}
@Injectable()
export class ModWandCoreMenu extends MenuHelper<SelectCoreContext> {
  constructor(private readonly coreService: WandCoreService) {
    super();
  }
  buildUpContext(context: ActionContext) {
    return context as SelectCoreContext;
  }
  getMenuPrompt(context: SelectCoreContext): InteractionReplyOptions {
    const { core } = context;
    return core.toReply();
  }

  @MenuAction('Adicionar Bônus')
  async addBonus(context: SelectCoreContext) {
    const { interaction, core } = context;
    await interaction.editReply({
      content: 'Adicionar Bônus',
      embeds: [],
    });
    await BonusMenuHelper.addBonus(context, async (i, bonus) => {
      core.bonuses.push(bonus);
      await this.coreService.save(core);
      await this.handle(context);
    });
  }

  @MenuAction('Remover Bônus')
  async removeBonus(context: SelectCoreContext) {
    const { interaction, core } = context;
    await interaction.editReply({
      content: 'Remover Bônus',
      embeds: [],
    });
    await BonusMenuHelper.removeBonus(
      context,
      async (i, bonus) => {
        core.bonuses = core.bonuses.filter((b) => b.id !== bonus.id);
        await this.coreService.save(core);
        await this.handle(context);
      },
      core.bonuses,
    );
  }
}

@Group({
  name: 'mod_varinha',
  description: 'Comandos relacionado a varinha',
})
@Injectable()
export class ModWandMenuGroup {
  constructor(
    private readonly woodService: WandWoodService,
    private readonly coreService: WandCoreService,
    private readonly woodMenu: ModWandWoodMenu,
    private readonly coreMenu: ModWandCoreMenu,
  ) {}

  @Command({
    name: 'madeira',
    description: 'Lista as madeiras disponíveis',
    mod: true,
  })
  async wood(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'nome',
      description: 'Nome da madeira',
    })
    name: string,
  ) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const wood = await this.woodService.findOne({
      where: { name: Like(name) },
    });
    if (!wood) {
      return interaction.followUp({
        content: 'Madeira não encontrada',
        ephemeral: true,
      });
    }
    return await this.woodMenu.handle(
      {
        guild,
        interaction,
        wood,
      },
      true,
    );
  }

  @Command({
    name: 'nucleo',
    description: 'Lista as madeiras disponíveis',
    mod: true,
  })
  async core(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'nome',
      description: 'Nome da madeira',
    })
    name: string,
  ) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const core = await this.coreService.findOne({
      where: { name: Like(name) },
    });
    if (!core) {
      return interaction.followUp({
        content: 'Nucleo não encontrada',
        ephemeral: true,
      });
    }
    return await this.coreMenu.handle(
      {
        guild,
        interaction,
        core,
      },
      true,
    );
  }
}
