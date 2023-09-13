import { CommandInteraction } from 'discord.js';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgBoolean,
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
    name: 'ver',
    description: 'Ver item(s)',
  })
  async viewItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgPlayer()
    player: Player,
    @ArgSpace()
    space: Space,
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
    let hidden = item.hidden;
    if (hidden) {
      const drops = await space.itemDrops;
      let hidden = !drops.some((d) => d.itemId === item.id);
    }
    if (hidden) {
      const inventory = await this.inventoryService.findOne({
        where: {
          player: {
            id: player.id,
          },
        },
        relations: {
          stacks: true,
        },
      });
      hidden = !inventory.stacks.some((s) => s.item.id === item.id);
    }
    if (hidden) {
      return i.followUp({
        content: `Você não tem informações sobre o item`,
      });
    }
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

    const drop = drops.find((d) => d.itemId === item.id && d.takeable);

    if (!drop)
      return i.followUp({
        content: `Item não encontrado / não é possível pegar`,
      });

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
}
