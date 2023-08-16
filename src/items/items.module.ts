import { Module } from '@nestjs/common';
import { ItemModule } from './item/item.module';
import { LootModule } from './loot/loot.module';
import { LootBoxModule } from './loot-box/loot-box.module';

@Module({
  imports: [ItemModule, LootModule, LootBoxModule],
})
export class ItemsModule {}
