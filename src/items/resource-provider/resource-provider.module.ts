import { Module } from '@nestjs/common';
import { ResourceProviderService } from './resource-provider.service';
import { ModResourceProviderMenu } from './resource-provider.menu';
import { ItemModule } from '../item/item.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceProviderResolver } from './resource-provider.resolver';
import { ItemPoolModule } from '../item-pool/item-pool.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ResourceProvider } from './entities/resource-provider.entity';
import { ProviderPlayerHistoryService } from './provider-player-history.service';
import { ProviderPlayerHistory } from './entities/provider-player-history.entity';
import { ItemDrop } from '../item/entities/item-drop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceProvider, ProviderPlayerHistory]),
    ItemModule,
    ItemPoolModule,
    InventoryModule,
  ],
  providers: [
    ResourceProviderService,
    ModResourceProviderMenu,
    ResourceProviderResolver,
    ProviderPlayerHistoryService,
  ],
  exports: [ResourceProviderService],
})
export class ResourceProviderModule {}
