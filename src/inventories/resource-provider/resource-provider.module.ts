import { Module } from '@nestjs/common';
import { ResourceProviderService } from './resource-provider.service';
import { ResourceProviderMenu } from './resource-provider.menu';
import { ItemModule } from '../item/item.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceProvider } from './resource-provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceProvider]), ItemModule],
  providers: [ResourceProviderService, ResourceProviderMenu],
})
export class ResourceProviderModule {}
