import { Module, forwardRef } from '@nestjs/common';
import { GrimoireMenu } from './grimoire.menu';
import { SpellModule } from '~/spell/spell.module';
import { SpellSlotsModule } from '~/spell/spell-slots/spell-slots.module';
import { PlayerModule } from '~/core/player/player.module';
import { GrimoireService } from './grimoire.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grimoire } from './entities/grimoire.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grimoire]),
    forwardRef(() => SpellModule),
    SpellSlotsModule,
    PlayerModule,
  ],
  providers: [GrimoireMenu, GrimoireService],
  exports: [GrimoireMenu, GrimoireService],
})
export class GrimoireModule {}
