import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { Player } from '~/core/player/entities/player.entity';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgInteraction,
  ArgPlayer,
} from '~/discord/decorators/message.decorators';
import { InventoryService } from './inventory.service';
import { PaginationHelper } from '~/discord/helpers/page-helper';
import { createInventoryGridImage } from './inventory.viewer';

@Group({
  name: 'inventario',
  description: 'Comando para gerenciar o inventário',
})
@Injectable()
export class InventoryGroup {
  constructor(private readonly inventoryService: InventoryService) {}

  // ver inventário
  @Command({
    name: 'ver',
    description: 'Ver o inventário',
  })
  async viewInventory(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
  ) {
    await interaction.deferReply({
      ephemeral: true,
    });

    const inventory = await this.inventoryService.getOrCreate(
      {
        where: {
          player: {
            id: player.id,
          },
        },
        relations: {
          stacks: {
            item: true,
          },
        },
      },
      {
        player,
      },
    );
    inventory.stacks = inventory.stacks || [];

    const inventoryImageBuffer = await createInventoryGridImage(
      inventory,
      this.inventoryService,
    );
    await interaction.followUp({
      files: [
        {
          attachment: inventoryImageBuffer,
          name: 'inventory.png',
        },
      ],
      content: `Inventário de ${player.name}`,
    });
  }
}
