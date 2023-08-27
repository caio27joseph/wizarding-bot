import { Injectable } from '@nestjs/common';
import {
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  InteractionReplyOptions,
  MessageReplyOptions,
} from 'discord.js';
import { Guild } from '~/core/guild/guild.entity';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgGuild,
  ArgInteraction,
  ArgSpace,
  ArgString,
} from '~/discord/decorators/message.decorators';
import {
  ActionContext,
  MenuAction,
  MenuHelper,
} from '~/discord/helpers/menu-helper';
import { Space } from '~/spaces/space/entities/space.entity';
import { ItemService } from '../item/item.service';
import { Item } from '../item/entities/item.entity';
import { ResourceProviderService } from './resource-provider.service';
import { FormConfig, FormHelper } from '~/discord/helpers/form-helper';
import { NewResourceProviderProps } from './forms/new-provider.form';
import { subtract } from 'lodash';
import { subtractDays } from '~/utils/date.utils';
import { MessageCollectorHelper } from '~/discord/helpers/message-collector-helper';
import { Like } from 'typeorm';

export interface ResourceProviderActionContext extends ActionContext {
  space: Space;
  item?: Item;
}

@Group({
  name: 'mod_resource',
  description: 'Resource related commands',
})
@Injectable()
export class ResourceProviderMenu extends MenuHelper<ActionContext> {
  constructor(
    private readonly itemService: ItemService,
    private readonly service: ResourceProviderService,
  ) {
    super();
  }

  @Command({
    name: 'default',
    description: 'Default command for this group',
    mod: true,
  })
  async entry(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgSpace() space: Space,
    @ArgString({
      name: 'nome',
      description: 'Nome do recurso',
      required: false,
    })
    name?: string,
  ) {
    await interaction.deferReply({ ephemeral: true });

    const context: ResourceProviderActionContext = {
      interaction,
      guild,
      space,
    };
    if (name) {
      const item = await this.itemService.findOne({
        where: {
          name: Like(name),
          guildId: guild.id,
        },
      });
      context.item = item;
    }

    await this.handle(context, true);
  }

  buildUpContext(context: unknown): ActionContext | Promise<ActionContext> {
    return context as ResourceProviderActionContext;
  }

  getMenuPrompt(context: ResourceProviderActionContext) {
    const content = context.item
      ? `You selected ${context.item.name}`
      : 'No item selected';
    const reply: MessageReplyOptions = {
      content,
    };
    return reply;
  }

  @MenuAction('Novo Gerador')
  async createProvider(context: ResourceProviderActionContext) {
    const reply: InteractionReplyOptions = {
      content: 'Hora de Criar um Novo Gerador de Recurso',
      components: [],
    };

    if (!context.item) {
      reply.content = 'No item selected';
      await context.interaction.editReply(reply);
      return;
    }

    const config: FormConfig<NewResourceProviderProps> = {
      label: `Novo Provedor de Item:${context.item.name}`,
      fields: [
        {
          placeholder: 'Dias de cooldown',
          propKey: 'daysCooldown',
          defaultValue: 1,
          options: [1, 2, 3, 5, 7, 9, 14, 20, 30].map((n) => ({
            label: n.toString() + ' dias',
            value: n.toString(),
          })),
          pipe: (value) => parseInt(value),
        },
        {
          placeholder: 'Quantidade Mínima de Recursos [0]',
          propKey: 'minAmount',
          defaultValue: 0,
          options: [0, 1, 2, 3, 4, 5, 7, 10, 15, 20].map((n) => ({
            label: n.toString() + ` ${context.item.name}`,
            value: n.toString(),
          })),
          pipe: (value) => parseInt(value),
        },
        {
          placeholder: 'Quantidade Máxima de Recursos [10]',
          propKey: 'maxAmount',
          defaultValue: 10,
          options: [3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((n) => ({
            label: n.toString() + ` ${context.item.name}`,
            value: n.toString(),
          })),
          pipe: (value) => parseInt(value),
        },
        {
          placeholder: 'Meta para conseguir o máximo [6]',
          propKey: 'metaForMaxAmount',
          defaultValue: 6,
          options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
            label: n.toString() + ` ${context.item.name}`,
            value: n.toString(),
          })),
          pipe: (value) => parseInt(value),
        },
      ],
      buttons: [
        {
          label: 'Criar',
          style: ButtonStyle.Success,
          handler: async (i, form) => {
            let lastTimeOpened = subtractDays(new Date(), form.daysCooldown);

            const collector = new MessageCollectorHelper(context);

            const name = await collector.prompt('Digite o nome do provedor');
            const description = await collector.prompt(
              'Digite a descrição do provedor',
            );

            const rp = await this.service.create({
              item: context.item,
              daysCooldown: form.daysCooldown,
              minAmount: form.minAmount,
              maxAmount: form.maxAmount,
              metaForMaxAmount: form.metaForMaxAmount,

              amountForExtraDrop: 1,
              lastTimeOpened: lastTimeOpened,
              name,
              description,
              space: context.space,
            });
            await context.interaction.editReply({
              content: 'Area com recursos criada com sucesso!',
              embeds: [
                new EmbedBuilder()
                  .setTitle(rp.name)
                  .setDescription(rp.description)
                  .setAuthor({
                    name: 'Gerador de ' + context.item.name,
                  })
                  .setThumbnail(rp.item.imageUrl),
              ],
            });
          },
        },
      ],
    };

    new FormHelper<NewResourceProviderProps>(context, config).init();
  }

  @MenuAction('Ver Geradores')
  async listProviders(context: ResourceProviderActionContext) {
    const providers = await this.service.findAll({
      where: {
        space: {
          id: context.space.id,
        },
      },
    });

    try {
      await context.interaction.editReply({
        content: 'Lista de Geradores no Local!',
        embeds: providers.map((p) => p.toEmbed()),
      });
    } catch (e) {
      debugger;
    }
  }
}
