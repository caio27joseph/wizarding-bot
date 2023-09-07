import { Module, forwardRef } from '@nestjs/common';
import { GrimoireMenu } from './grimoire.menu';
import { SpellModule } from '~/spell/spell.module';
import { PlayerModule } from '~/core/player/player.module';
import { GrimoireService } from './grimoire.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grimoire } from './entities/grimoire.entity';
import { TrainModule } from '~/evolution/train/train.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grimoire]),
    forwardRef(() => SpellModule),
    forwardRef(() => TrainModule),
    PlayerModule,
  ],
  providers: [GrimoireMenu, GrimoireService],
  exports: [GrimoireMenu, GrimoireService],
})
export class GrimoireModule {}
