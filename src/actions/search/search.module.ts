import { Module } from '@nestjs/common';
import { SearchGroup } from './search.group';
import { ResourceProviderModule } from '~/items/resource-provider/resource-provider.module';
import { InventoryModule } from '~/items/inventory/inventory.module';
import { ItemModule } from '~/items/item/item.module';

@Module({
  imports: [ResourceProviderModule, InventoryModule, ItemModule],
  providers: [SearchGroup],
})
export class SearchModule {}
