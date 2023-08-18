import { Module, forwardRef } from '@nestjs/common';
import { TrainService } from './train.service';
import { MaestryGroup, TrainGroup } from './train.group';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Train } from './entities/train.entity';
import { PlayerModule } from '~/core/player/player.module';
import { RollModule } from '~/roll/roll.module';
import { SpellModule } from '~/spell/spell.module';
import { Spell } from '~/spell/entities/spell.entity';
import { TrainSpellMenu } from './train-spell.menu';
import { TrainSpellService } from './train-spell.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Train]),
    PlayerModule,
    RollModule,
    forwardRef(() => SpellModule),
  ],
  providers: [
    TrainService,
    MaestryGroup,
    TrainSpellMenu,
    TrainSpellService,
    TrainGroup,
  ],

  exports: [MaestryGroup, TrainSpellMenu],
})
export class TrainModule {}
