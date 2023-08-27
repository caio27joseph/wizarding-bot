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
export class WandWoodMenu extends MenuHelper<SelectWoodContext> {
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
}
@Injectable()
export class WandCoreMenu extends MenuHelper<SelectCoreContext> {
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
}

@Group({
  name: 'varinha',
  description: 'Comandos relacionado a varinha',
})
@Injectable()
export class FirstWandMenuGroup {
  constructor(
    private readonly woodService: WandWoodService,
    private readonly coreService: WandCoreService,
    private readonly woodMenu: WandWoodMenu,
    private readonly coreMenu: WandCoreMenu,
  ) {}

  @Command({
    name: 'default',
    description: 'Criar a primeira varinha do personagem',
  })
  async firstWand() {
    // Form to get the rarity
    // Form to get the wood
  }
}

@Group({
  name: 'varinhas',
  description: 'Comandos relacionado a varinha',
})
@Injectable()
export class WandMenuGroup {
  constructor(
    private readonly woodService: WandWoodService,
    private readonly coreService: WandCoreService,
    private readonly woodMenu: WandWoodMenu,
    private readonly coreMenu: WandCoreMenu,
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
