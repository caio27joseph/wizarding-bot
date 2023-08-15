import { normalizedName } from '../discord.utils';
import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ButtonInteraction,
  CommandInteraction,
  InteractionResponse,
  StringSelectMenuInteraction,
  MessagePayload,
  Interaction,
  InteractionReplyOptions,
} from 'discord.js';
import { v4 } from 'uuid';
import 'reflect-metadata';
import { Player } from '~/core/player/entities/player.entity';
import { Guild } from '~/core/guild/guild.entity';

const ACTION_KEY = Symbol('ACTION_KEY');

export function MenuAction(label: string): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const actions = Reflect.getMetadata(ACTION_KEY, target.constructor) || [];
    const customId = normalizedName(label);
    actions.push({
      label: label,
      customId: customId,
      methodName: propertyKey,
    });
    Reflect.defineMetadata(ACTION_KEY, actions, target.constructor);
  };
}

export interface MenuActionOptions {
  disabled: boolean;
  hash: string;
}

export interface ActionContext {
  player: Player;
  guild: Guild;
  interaction: CommandInteraction;
  i?: ButtonInteraction<CacheType> | StringSelectMenuInteraction<CacheType>;
  response: InteractionResponse<boolean>;
  hash: string;
}

export interface MenuActionOptions {
  disabled: boolean;
  hash: string;
}

@Injectable()
export abstract class MenuHelper<T extends ActionContext> {
  async handle<U extends ActionContext>(context: U | T) {
    context = await this.buildUpContext(context);
    context.hash = v4();
    const content = await this.getMenuPrompt(context);
    content.components = [
      await this.options({
        disabled: false,
        hash: context.hash,
      }),
    ];
    content.ephemeral = true;
    const message = await context.i.reply(content);

    const collector = context.response.createMessageComponentCollector({
      filter: (i: ButtonInteraction<CacheType>) => {
        return i.user.id === context.player.discordId;
      },
      time: 20000,
      max: 1,
    });

    collector.on('collect', async (i) => {
      context.i = i as ButtonInteraction<CacheType>;
      await message.delete();
      await this.redirect(context as T);
    });
  }
  abstract buildUpContext(context: unknown): Promise<T>;

  abstract getMenuPrompt(context: T): Promise<InteractionReplyOptions>;

  async options(
    options: MenuActionOptions,
  ): Promise<ActionRowBuilder<ButtonBuilder>> {
    const actionsMetadata =
      Reflect.getMetadata(ACTION_KEY, this.constructor) || [];
    const actionRow = new ActionRowBuilder<ButtonBuilder>();
    for (const action of actionsMetadata) {
      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(action.customId + options.hash)
          .setLabel(action.label)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(options.disabled),
      );
    }
    return actionRow;
  }

  async redirect(context: T): Promise<void> {
    const actionsMetadata =
      Reflect.getMetadata(ACTION_KEY, this.constructor) || [];
    const action = actionsMetadata.find((a) =>
      context.i.customId.startsWith(a.customId + context.hash),
    );
    if (action) {
      await (this as any)[action.methodName](context);
    }
  }
}
