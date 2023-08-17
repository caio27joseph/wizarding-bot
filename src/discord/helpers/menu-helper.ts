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
  EmbedBuilder,
  MessageReplyOptions,
} from 'discord.js';
import { v4 } from 'uuid';
import 'reflect-metadata';
import { Player } from '~/core/player/entities/player.entity';
import { Guild } from '~/core/guild/guild.entity';
import { DiscordSimpleError } from '../exceptions';

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
  interaction?: CommandInteraction;
  i:
    | ButtonInteraction<CacheType>
    | StringSelectMenuInteraction<CacheType>
    | CommandInteraction<CacheType>;
  response?: InteractionResponse<boolean>;
}

export interface MenuActionOptions {
  disabled: boolean;
  hash: string;
}

@Injectable()
export abstract class MenuHelper<T extends ActionContext> {
  private __hash: string;
  async handle<U extends ActionContext>(context: U | T) {
    context = await this.buildUpContext(context);
    this.__hash = v4();
    const content = (await this.getMenuPrompt(
      context,
    )) as InteractionReplyOptions;
    content.components = [
      await this.options({
        disabled: false,
        hash: this.__hash,
      }),
    ];
    content.fetchReply = true;
    content.ephemeral = true;
    let response;
    if (context.i.isRepliable()) {
      try {
        response = await context.i.reply(content);
      } catch (error) {
        response = await context.i.followUp(content);
      }
    } else if (context.interaction.isRepliable()) {
      try {
        response = await context.interaction.reply(content);
      } catch (error) {
        response = await context.interaction.followUp(content);
      }
    }

    context.response = context.response || response;
    const collector = context.response.createMessageComponentCollector({
      filter: (i: ButtonInteraction<CacheType>) => {
        return i.user.id === context.player.discordId;
      },
      time: 20000,
      max: 1,
    });
    collector.on('collect', async (i) => {
      try {
        context.i = i as ButtonInteraction<CacheType>;
        await response.delete();
        collector.stop();
        await this.redirect(context as T);
      } catch (error) {
        const canReply = i.isRepliable();
        if (canReply) {
          await i.reply({ content: `${error.message}`, ephemeral: true });
        }
        if (context.guild.errorLogChannel) {
          await context.guild.errorLogChannel.send({
            content: `<@${context.player.discordId}>, encontrou um: ${error.message}`,
            embeds: [
              new EmbedBuilder().setTitle('Stack').setDescription(error.stack),
              new EmbedBuilder()
                .setTitle('Interaction')
                .setDescription(
                  context.interaction.toString() +
                    JSON.stringify(
                      context.interaction.toJSON(),
                      (_, v) => (typeof v === 'bigint' ? v.toString() : v),
                      2,
                    ),
                ),
            ],
          });
        }
      }
    });
  }
  abstract buildUpContext(context: unknown): Promise<T> | T;

  abstract getMenuPrompt(
    context: T,
  ):
    | Promise<InteractionReplyOptions>
    | Promise<MessageReplyOptions>
    | InteractionReplyOptions
    | MessageReplyOptions;

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
      (context.i as StringSelectMenuInteraction).customId.startsWith(
        a.customId + this.__hash,
      ),
    );
    if (action) {
      await (this as any)[action.methodName](context);
    }
  }
}
