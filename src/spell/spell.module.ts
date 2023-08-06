import { Module } from '@nestjs/common';
import { SpellService } from './spell.service';
import { SpellResolver } from './spell.resolver';
import { SpellSlotsModule } from './spell-slots/spell-slots.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spell } from './entities/spell.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Spell]), SpellSlotsModule],
  providers: [SpellResolver, SpellService],
})
export class SpellModule {}
