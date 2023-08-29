import { Injectable } from '@nestjs/common';
import {
  ButtonStyle,
  CommandInteraction,
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
import { ResourceProviderService } from './resource-provider.service';
import { Like } from 'typeorm';
import {
  ResourceProviderActionContext,
  getNewProviderInput,
} from './forms/new-provider.form';
import { MessageCollectorHelper } from '~/discord/helpers/message-collector-helper';
import { subtractDays } from '~/utils/date.utils';

@Group({
  name: 'mod_resource',
  description: 'Resource related commands',
})
@Injectable()
export class ModResourceProviderMenu extends MenuHelper<ActionContext> {
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
      content: 'Vamos criar uma nova fonte de Recurso',
      components: [],
    };

    if (!context.item) {
      reply.content = 'No item selected';
      await context.interaction.editReply(reply);
      return;
    }
    const form = await getNewProviderInput(context);
    const collector = new MessageCollectorHelper(context);

    const name = await collector.prompt('Digite o nome do Gerador');
    const description = await collector.prompt('Digite a descrição do Gerador');
    const imageUrl = await collector.prompt(
      'Digite a URL da imagem do Gerador',
    );
    const lastTimeOpened = subtractDays(new Date(), form.daysCooldown);

    const provider = await this.service.create({
      ...form,
      name,
      description,
      imageUrl,
      lastTimeOpened,
      lastTimeSearched: lastTimeOpened,
      item: context.item,
      space: context.space,
    });
    await context.interaction.editReply({
      content: 'Gerador Criado!',
      embeds: [provider.toEmbed()],
    });
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
