import { Module } from '@nestjs/common';
import { SpellService } from './spell.service';
import { SpellResolver } from './spell.resolver';
import { SpellSlotsModule } from './spell-slots/spell-slots.module';

@Module({
  providers: [SpellResolver, SpellService],
  imports: [SpellSlotsModule]
})
export class SpellModule {}
