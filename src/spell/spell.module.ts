import { Module } from '@nestjs/common';
import { SpellService } from './spell.service';
import { SpellResolver } from './spell.resolver';
import { SpellSlotsModule } from './spell-slots/spell-slots.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spell } from './entities/spell.entity';
import { SpellGroup } from './spell.group';

@Module({
  imports: [TypeOrmModule.forFeature([Spell]), SpellSlotsModule],
  providers: [SpellResolver, SpellService, SpellGroup],
  exports: [SpellService],
})
export class SpellModule {}
