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
import { waitForEvent } from '~/utils/wait-for-event';
import { RollEvent } from '~/roll/roll.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getNewValidRollForm } from './forms/new-valid-roll.form';

@Group({
  name: 'mod_resource',
  description: 'Resource related commands',
})
@Injectable()
export class ModResourceProviderMenu extends MenuHelper<ActionContext> {
  constructor(
    private readonly itemService: ItemService,
    private readonly service: ResourceProviderService,
    private readonly eventEmitter: EventEmitter2,
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
      name: 'item',
      description: 'Nome do item que está sendo procurado',
      required: false,
    })
    itemName?: string,
    @ArgString({
      name: 'fonte',
      description: 'Nome da fonte de recurso que está procurando',
      required: false,
    })
    providerName?: string,
  ) {
    await interaction.deferReply({ ephemeral: true });

    const context: ResourceProviderActionContext = {
      interaction,
      guild,
      space,
    };

    if (itemName) {
      const item = await this.itemService.findOne({
        where: {
          name: Like(itemName),
          guildId: guild.id,
        },
      });
      context.item = item;
    }
    if (providerName) {
      const provider = await this.service.findOne({
        where: {
          name: Like(providerName),
          space: {
            id: space.id,
          },
        },
      });
      context.provider = provider;
    }

    await this.handle(context, true);
  }

  buildUpContext(context: unknown): ActionContext | Promise<ActionContext> {
    return context as ResourceProviderActionContext;
  }

  getMenuPrompt(context: ResourceProviderActionContext) {
    let content = 'O que você quer fazer?';
    const embeds = [];
    if (context.item) {
      content += `\nItem: ${context.item.name}`;
      embeds.push(context.item.toEmbed());
    }
    if (context.provider) {
      content += `\nFonte: ${context.provider.name}`;
      embeds.push(context.provider.toEmbed());
    }
    const reply: MessageReplyOptions = {
      content,
      embeds,
    };
    return reply;
  }

  @MenuAction('Novo')
  async createProvider(context: ResourceProviderActionContext) {
    const reply: InteractionReplyOptions = {
      content: 'Vamos criar uma nova fonte de Recurso',
      components: [],
    };

    if (!context.item) {
      reply.content = 'Nenhum item seleconado';
      await context.interaction.editReply(reply);
      return;
    }
    const form = await getNewProviderInput(context);
    const collector = new MessageCollectorHelper(context);

    const name = await collector.prompt('Digite o nome da fonte de recurso');
    const description = await collector.prompt(
      'Digite a descrição da fonte de recurso',
    );
    const imageUrl = await collector.prompt(
      'Digite a URL da imagem da Fonte do recurso',
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

  @MenuAction('Listar')
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
        content: 'Lista de fontes de recurso no Local!',
        embeds: providers.map((p) => p.toEmbed(true)),
      });
    } catch (e) {
      debugger;
    }
  }

  @MenuAction('Remover')
  async removeProvider(context: ResourceProviderActionContext) {
    if (!context.provider) {
      await context.interaction.editReply({
        content: 'Nenhuma fonte selecionada',
      });
      return;
    }
    await this.service.remove({
      id: context.provider.id,
    });
    await context.interaction.editReply({
      content: 'Fonte removida',
    });
  }

  // Add Roll
  @MenuAction('Adicionar Rolagem')
  async addRoll(context: ResourceProviderActionContext) {
    const { provider } = context;
    context.item = provider.item;
    if (!provider) {
      await context.interaction.editReply('Nenhuma fonte selecionada');
      return;
    }
    const form = await getNewValidRollForm(context);

    await context.interaction.followUp({
      content: 'Execute a rolagem adicionar',
      ephemeral: true,
    });
    const { roll, options }: RollEvent = await waitForEvent(
      this.eventEmitter,
      'roll',
      (data: RollEvent) => true,
    );

    provider.rolls.push({
      attribute: options.attribute,
      hab1: options.hab1,
      hab2: options.hab2,
      hab3: options.hab3,
      witchPredilection: options.witchPredilection,
      extras: options.extras,
      meta: options.meta,
      // spell: options.spell,
      secret: form.secret,
      // secret: options.secret,
    });
    await this.service.save(provider);
    await context.interaction.followUp({
      content: 'Rolagem adicionada',
      embeds: [provider.toEmbed()],
      ephemeral: true,
    });
  }
}
