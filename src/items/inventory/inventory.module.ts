import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { StackService } from './stack.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Stack } from './entities/stack.entity';
import { InventoryGroup } from './inventory.group';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Stack])],
  providers: [InventoryService, StackService, InventoryGroup],
  exports: [InventoryService, StackService],
})
export class InventoryModule {}
