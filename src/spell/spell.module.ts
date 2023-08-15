import { Module } from '@nestjs/common';
import { SpellService } from './spell.service';
import { SpellResolver } from './spell.resolver';
import { SpellSlotsModule } from './spell-slots/spell-slots.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spell } from './entities/spell.entity';
import { SpellGroup } from './spell.group';
import { TrainModule } from '~/train/train.module';
import { PlayerModule } from '~/core/player/player.module';
import { GrimoireModule } from '~/grimoire/grimoire.module';
import { SpellMenuGroup } from './spell.menu.group';

@Module({
  imports: [
    TypeOrmModule.forFeature([Spell]),
    SpellSlotsModule,
    TrainModule,
    PlayerModule,
    GrimoireModule,
  ],
  providers: [SpellResolver, SpellService, SpellGroup, SpellMenuGroup],
  exports: [SpellService],
})
export class SpellModule {}
