import { Module } from '@nestjs/common';
import { ItemModule } from './item/item.module';
import { ResourceProviderModule } from './resource-provider/resource-provider.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [ItemModule, ResourceProviderModule, InventoryModule],
})
export class InventoriesModule {}
