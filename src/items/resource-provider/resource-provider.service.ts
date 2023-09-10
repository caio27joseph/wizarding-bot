import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { ResourceProvider } from './resource-provider.entity';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryService } from '../inventory/inventory.service';
import { CommandInteraction } from 'discord.js';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';

@Injectable()
export class ResourceProviderService extends BasicService<
  ResourceProvider,
  DeepPartial<ResourceProvider>,
  QueryDeepPartialEntity<ResourceProvider>
> {
  constructor(
    @InjectRepository(ResourceProvider)
    private readonly repo: Repository<ResourceProvider>,
    private readonly eventEmitter: EventEmitter2,
    private readonly inventoryService: InventoryService,
  ) {
    super(repo);
  }

  entityName = 'LootBox';

  async collectResource(
    interaction: CommandInteraction,
    player: Player,
    provider: ResourceProvider,
  ) {
    const result = await provider.open({
      player,
      interaction,
      eventEmitter: this.eventEmitter,
    });
    if (!result) {
      throw new DiscordSimpleError('Sem sorte dessa vez');
    }
    const { item, drops } = result;

    const stack = await this.inventoryService.addItemToPlayerInventory(
      player,
      item,
      drops,
    );

    if (drops === 0) {
      await interaction.followUp({
        content: `Você não coletou nenhum item dessa vez...\n`,
      });
      provider.lastTimeOpened = new Date();
      await this.save(provider);
      return;
    }
    await interaction.followUp({
      content: `Você coletou '${item.name} x${drops}'\n`,
      embeds: [stack.toEmbed()],
    });
    provider.lastTimeOpened = new Date();

    await this.save(provider);
  }
}
