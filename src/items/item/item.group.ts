import { CommandInteraction } from 'discord.js';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgGuild,
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgSpace,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { ItemService } from './item.service';
import { Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';
import { EntityAlreadyExists } from '~/discord/exceptions';
import { Guild } from '~/core/guild/guild.entity';
import { PaginationHelper } from '~/discord/helpers/page-helper';
import { Space } from '~/spaces/space/entities/space.entity';
import { ItemDropService } from './item-drop.service';
import { InventoryService } from '../inventory/inventory.service';
import { Player } from '~/core/player/entities/player.entity';

@Group({
  name: 'item',
  description: 'Comandos relacionando ao gerenciamento de itens',
})
@Injectable()
export class ItemGroup {
  constructor(
    private readonly service: ItemService,
    private readonly itemDropsService: ItemDropService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Command({
    name: 'create',
    description: 'Create item(s)',
  })
  async createItem(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgString({
      name: 'Nome',
      description: 'Nome do item',
    })
    name: string,
    @ArgString({
      name: 'imageUrl',
      description: 'Url da imagem do item',
    })
    imageUrl: string,
  ) {
    const itemExists = await this.service.findOne({
      where: {
        name: ILike(name),
      },
    });
    if (itemExists) throw new EntityAlreadyExists('Item', name);
    const response = await interaction.reply({
      content: 'Criando item... Informe a Descrição',
    });
    const collected = await interaction.channel.awaitMessages({
      filter: (i) => i.author.id === interaction.user.id,
      time: 60000,
      max: 1,
    });
    const descMessage = collected.first();
    const description = descMessage.content;
    const item = await this.service.create({
      name,
      description,
      imageUrl,
      guildId: guild.id,
    });
    await response.edit({
      content: `Item criado com sucesso!`,
      embeds: [item.toEmbed()],
    });

    await descMessage.delete();
  }
  @Command({
    name: 'list',
    description: 'List item(s)',
  })
  async listItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {
    await i.deferReply({ ephemeral: true });
    const items = await this.service.findAll({
      where: {
        guildId: guild.id,
      },
    });

    await new PaginationHelper({
      header: `${items.length} itens encontrados`,
      itemsPerPage: 10,
      items,
      formatter: async (item, index, array) => {
        return `### ${item.name}\n${item.description.slice(0, 200)}\n---`;
      },
    }).followUp(i);
  }
  @Command({
    name: 'ver',
    description: 'Ver item(s)',
  })
  async getItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgString({
      name: 'Nome',
      description: 'Nome do item',
    })
    name: string,
  ) {
    await i.deferReply({ ephemeral: true });

    const item = await this.service.findOneOrFail({
      where: {
        name: ILike(name),
        guildId: guild.id,
      },
    });
    await i.followUp({
      embeds: [item.toEmbed()],
    });
  }

  @Command({
    name: 'pegar',
    description: 'Ver item(s)',
  })
  async takeItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgPlayer() player: Player,
    @ArgGuild() guild: Guild,
    @ArgSpace() space: Space,
    @ArgString({
      name: 'Nome',
      description: 'Nome do item',
    })
    name: string,
    @ArgInteger({
      name: 'Quantidade',
      description: 'Quantidade de itens',
    })
    amount: number,
  ) {
    await i.deferReply({ ephemeral: true });

    const drops = await space.itemDrops;

    const item = await this.service.findOneOrFail({
      where: {
        name: ILike(name),
        guildId: guild.id,
      },
    });

    const drop = drops.find((d) => d.itemId === item.id);

    if (!drop) {
      await i.followUp({
        content: `Não há nenhum item desse tipo aqui`,
      });
      return;
    }
    const total = amount > drop.amount ? drop.amount : amount;

    const stack = await this.inventoryService.addItemToPlayerInventory(
      player,
      item,
      total,
    );

    if (drop.amount - total <= 0) {
      await this.itemDropsService.remove({
        id: drop.id,
      });
    } else {
      drop.amount -= total;
      await this.itemDropsService.save(drop);
    }

    await i.followUp({
      content: `Você pegou ${item.name} x${total}`,
      embeds: [stack.toEmbed()],
    });
  }

  @Command({
    name: 'force_drop',
    description: 'Dropa algum item no espaço',
    mod: true,
  })
  async forceDropItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgSpace() space: Space,
    @ArgString({
      name: 'Nome',
      description: 'Nome do item',
    })
    name: string,
    @ArgInteger({
      name: 'Quantidade',
      description: 'Quantidade de itens',
    })
    amount: number,
    @ArgInteger({
      name: 'Meta Percepção',
      description: 'Quantidade de itens',
    })
    meta: number,
  ) {
    await i.deferReply({ ephemeral: true });

    const item = await this.service.findOneOrFail({
      where: {
        name: ILike(name),
        guildId: guild.id,
      },
    });

    const drop = await this.itemDropsService.create({
      item,
      amount,
      space,
      meta,
    });

    await i.followUp({
      content: `Você dropou ${item.name} x${amount}`,
      embeds: [drop.item.toEmbed()],
    });
  }
}
