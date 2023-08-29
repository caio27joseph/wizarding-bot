import { Module } from '@nestjs/common';
import { SearchGroup } from './search.group';
import { ResourceProviderModule } from '~/items/resource-provider/resource-provider.module';
import { InventoryModule } from '~/items/inventory/inventory.module';

@Module({
  imports: [ResourceProviderModule, InventoryModule],
  providers: [SearchGroup],
})
export class SearchModule {}
