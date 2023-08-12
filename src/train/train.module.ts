import { Module } from '@nestjs/common';
import { TrainService } from './train.service';
import { TrainGroup } from './train.group';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Train } from './entities/train.entity';
import { PlayerModule } from '~/core/player/player.module';
import { RollModule } from '~/roll/roll.module';

@Module({
  imports: [TypeOrmModule.forFeature([Train]), PlayerModule, RollModule],
  providers: [TrainService, TrainGroup],
  exports: [TrainGroup],
})
export class TrainModule {}
