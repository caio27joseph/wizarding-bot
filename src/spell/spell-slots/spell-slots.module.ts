import { Module } from '@nestjs/common';
import { SpellSlotsService } from './spell-slots.service';
import { SpellSlotsResolver } from './spell-slots.resolver';

@Module({
  providers: [SpellSlotsResolver, SpellSlotsService]
})
export class SpellSlotsModule {}
