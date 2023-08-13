import { Module, forwardRef } from '@nestjs/common';
import { TrainService } from './train.service';
import { TrainGroup } from './train.group';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Train } from './entities/train.entity';
import { PlayerModule } from '~/core/player/player.module';
import { RollModule } from '~/roll/roll.module';
import { SpellModule } from '~/spell/spell.module';
import { Spell } from '~/spell/entities/spell.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Train]),
    PlayerModule,
    RollModule,
    forwardRef(() => SpellModule),
  ],
  providers: [TrainService, TrainGroup],
  exports: [TrainGroup],
})
export class TrainModule {}
