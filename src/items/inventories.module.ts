import { Module } from '@nestjs/common';
import { ItemModule } from './item/item.module';
import { ResourceProviderModule } from './resource-provider/resource-provider.module';
import { InventoryModule } from './inventory/inventory.module';
import { PlayerSetModule } from './player-set/player-set.module';
import { WandModule } from './wand/wand.module';

@Module({
  imports: [
    ItemModule,
    ResourceProviderModule,
    InventoryModule,
    PlayerSetModule,
    WandModule,
  ],
})
export class ItemsModule {}
