import { Module } from '@nestjs/common';
import { LootBoxService } from './loot-box.service';

@Module({
  providers: [LootBoxService]
})
export class LootBoxModule {}
