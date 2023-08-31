import { Module } from '@nestjs/common';
import { ResourceProviderService } from './resource-provider.service';
import { ModResourceProviderMenu } from './resource-provider.menu';
import { ItemModule } from '../item/item.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceProvider } from './resource-provider.entity';
import { ResourceProviderResolver } from './resource-provider.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceProvider]), ItemModule],
  providers: [ResourceProviderService, ModResourceProviderMenu, ResourceProviderResolver],
  exports: [ResourceProviderService],
})
export class ResourceProviderModule {}
