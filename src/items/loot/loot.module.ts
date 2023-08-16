import { Module } from '@nestjs/common';
import { LootService } from './loot.service';

@Module({
  providers: [LootService],
})
export class LootModule {}
