import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { Item } from './entities/item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemGroup } from './item.group';
import { ItemDropService } from './item-drop.service';
import { ItemDrop } from './entities/item-drop.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forFeature([Item, ItemDrop]), InventoryModule],
  providers: [ItemService, ItemDropService, ItemGroup],
  exports: [ItemService, ItemDropService],
})
export class ItemModule {}
