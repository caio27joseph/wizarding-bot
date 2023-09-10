import { Injectable } from '@nestjs/common';
import { CommandInteraction, InteractionReplyOptions } from 'discord.js';
import { Group } from '~/discord/decorators/group.decorator';
import { ActionContext, MenuHelper } from '~/discord/helpers/menu-helper';
import { ItemPool } from './entitites/item-pool.entity';
import { Item } from '../item/entities/item.entity';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgInteraction,
  ArgGuild,
  ArgSpace,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { Space } from '~/spaces/space/entities/space.entity';
import { ItemService } from '../item/item.service';
import { ItemPoolService } from './item-pool.service';
import { Guild } from '~/core/guild/guild.entity';
import { MessageCollectorHelper } from '~/discord/helpers/message-collector-helper';
import { PaginationHelper } from '~/discord/helpers/page-helper';
import { ILike } from 'typeorm';
import { ItemPoolConfigService } from './item-pool-config.service';
import {
  ItemPoolRarity,
  ItemPoolRarityPortuguese,
} from './entitites/item-pool-config.entity';

interface ItemPoolActionContext extends ActionContext {
  item?: Item;
  itemPool?: ItemPool;
}

@Group({
  name: 'item_pool',
  description: 'Item pool related commands',
})
@Injectable()
export class ItemPoolGroup extends MenuHelper<ItemPoolActionContext> {
  constructor(
    private readonly itemService: ItemService,
    private readonly itemPoolConfigService: ItemPoolConfigService,
    private readonly service: ItemPoolService,
  ) {
    super();
  }

  buildUpContext(context: ItemPoolActionContext) {
    return context;
  }
  getMenuPrompt({ itemPool }: ItemPoolActionContext) {
    const options: InteractionReplyOptions = {
      content: 'Item pool menu',
      embeds: [itemPool && itemPool.toEmbed()],
    };
    return options;
  }

  @Command({
    name: 'criar',
    description: 'Cria um novo item pool',
    mod: true,
  })
  async createItemPool(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {
    await interaction.deferReply({ ephemeral: true });
    const helper = new MessageCollectorHelper(interaction);
    const title = await helper.prompt('Qual o título do item pool?');

    const itemPool = await this.service.create({
      guild,
      name: title,
    });

    await this.handle(
      {
        interaction,
        guild,
        itemPool,
      },
      true,
    );
  }

  @Command({
    name: 'listar',
    description: 'Cria um novo item pool',
    mod: true,
  })
  async listItemPool(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {
    await interaction.deferReply({ ephemeral: true });

    const itemPools = await this.service.findAll({
      where: {
        guild: {
          id: guild.id,
        },
      },
    });

    await new PaginationHelper({
      header: `${itemPools.length} item pools`,
      items: itemPools,
      formatter: async (pool, index, array) => {
        return (
          `${pool.name} - ID: ${pool.id}\n` +
          pool.configs
            .map(
              (c) => `\t${c.item.name} - ${ItemPoolRarityPortuguese[c.rarity]}`,
            )
            .join('\n')
        );
      },
      footer(currentPage, totalPages) {
        return `Página ${currentPage} de ${totalPages}`;
      },
      itemsPerPage: 10,
    }).followUp(interaction);
  }

  @Command({
    name: 'adicionar',
    description: 'Adiciona um item ao item pool',
    mod: true,
  })
  async addItemToPool(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgString({
      name: 'item',
      description: 'Nome do item',
    })
    itemName: string,
    @ArgString({
      name: 'itemPool',
      description: 'ID do item pool',
    })
    itemPoolId: string,
    @ArgString({
      name: 'rarity',
      description: 'Raridade do item',
      choices: Object.values(ItemPoolRarity).map((k) => ({
        name: ItemPoolRarityPortuguese[k],
        value: k,
      })),
    })
    rarity: ItemPoolRarity,
  ) {
    await interaction.deferReply({ ephemeral: true });

    const itemPool = await this.service.findOneOrFail({
      where: {
        id: itemPoolId,
      },
    });

    const item = await this.itemService.findOneOrFail({
      where: {
        name: ILike(itemName),
      },
    });

    if (itemPool.configs.some((c) => c.item.id === item.id)) {
      await interaction.editReply({
        content: `Item ${item.name} já está no item pool ${itemPool.name}`,
      });
      return;
    }

    await this.itemPoolConfigService.create({
      item,
      itemPool,
      rarity,
    });

    await interaction.editReply({
      content: `Item ${item.name} adicionado ao item pool ${itemPool.name} com raridade ${ItemPoolRarityPortuguese[rarity]}`,
    });
  }
}
