import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { Item } from './entities/item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemGroup } from './item.group';

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  providers: [ItemService, ItemGroup],
  exports: [ItemService],
})
export class ItemModule {}
