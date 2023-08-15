import { Injectable } from '@nestjs/common';
import { CommandInteraction, InteractionReplyOptions } from 'discord.js';
import {
  ActionContext,
  MenuAction,
  MenuHelper,
} from '~/discord/helpers/menu-helper';
import { SpellActionContext } from '~/spell/spell.group';

export interface HandleGrimorioActionOptions {
  interaction: CommandInteraction;
}

@Injectable()
export class GrimoireMenu extends MenuHelper<SpellActionContext> {
  buildUpContext(context: unknown): Promise<SpellActionContext> {
    throw new Error('Method not implemented.');
  }
  getMenuPrompt(context: SpellActionContext): Promise<InteractionReplyOptions> {
    throw new Error('Method not implemented.');
  }

  @MenuAction('Listar')
  async grimoire(context: SpellActionContext) {
    const { i, spell } = context;
    await i.reply({
      content: `Grimório de ${spell.name}`,
    });
  }

  @MenuAction('SLOT')
  async slot(context: SpellActionContext) {
    const { i, spell } = context;
    await i.reply({
      content: `Grimório de ${spell.name}`,
    });
  }
}
