import { Module, forwardRef } from '@nestjs/common';
import { PointLogsService } from './point-logs.service';
import { PointLogsResolver } from './point-logs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointLog } from './entities/point-log.entity';
import { HouseCup } from '../house-cup/entities/house-cup.entity';
import { HouseCupService } from '../house-cup/house-cup.service';
import { CoreModule } from '~/core/core.module';
import { HouseModule } from '~/core/house/house.module';
import { HouseCupModule } from '../house-cup/house-cup.module';
import { PlayerModule } from '~/core/player/player.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointLog, HouseCup]),
    PlayerModule,
    forwardRef(() => HouseCupModule),
    HouseModule,
  ],
  providers: [PointLogsResolver, PointLogsService],
  exports: [PointLogsService],
})
export class PointLogsModule {}
