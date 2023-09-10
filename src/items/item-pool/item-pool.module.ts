import { Module } from '@nestjs/common';
import { ItemPoolService } from './item-pool.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemPool } from './entitites/item-pool.entity';
import { ItemPoolGroup } from './item-pool.group';
import { ItemModule } from '../item/item.module';
import { ItemPoolConfigService } from './item-pool-config.service';
import { ItemPoolConfig } from './entitites/item-pool-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemPool, ItemPoolConfig]), ItemModule],
  providers: [ItemPoolService, ItemPoolGroup, ItemPoolConfigService],
  exports: [ItemPoolService, ItemPoolGroup, ItemPoolConfigService],
})
export class ItemPoolModule {}
