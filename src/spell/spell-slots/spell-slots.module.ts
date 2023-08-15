import { Module } from '@nestjs/common';
import { SpellSlotsService } from './spell-slots.service';
import { SpellSlotsResolver } from './spell-slots.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpellSlot } from './entities/spell-slot.entity';
import { ExtrasModule } from '~/player-system/extras/extras.module';

@Module({
  imports: [TypeOrmModule.forFeature([SpellSlot]), ExtrasModule],
  providers: [SpellSlotsResolver, SpellSlotsService],
  exports: [SpellSlotsService],
})
export class SpellSlotsModule {}
