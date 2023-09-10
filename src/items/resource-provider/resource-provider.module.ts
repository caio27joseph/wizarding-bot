import { Module } from '@nestjs/common';
import { ResourceProviderService } from './resource-provider.service';
import { ModResourceProviderMenu } from './resource-provider.menu';
import { ItemModule } from '../item/item.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceProvider } from './resource-provider.entity';
import { ResourceProviderResolver } from './resource-provider.resolver';
import { ItemPoolModule } from '../item-pool/item-pool.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceProvider]),
    ItemModule,
    ItemPoolModule,
    InventoryModule,
  ],
  providers: [
    ResourceProviderService,
    ModResourceProviderMenu,
    ResourceProviderResolver,
  ],
  exports: [ResourceProviderService],
})
export class ResourceProviderModule {}
