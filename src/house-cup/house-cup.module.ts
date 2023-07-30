import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseCup } from './house-cup/entities/house-cup.entity';
import { CoreModule } from '~/core/core.module';
import { PointLogsModule } from './point-logs/point-logs.module';
import { PointLog } from './point-logs/entities/point-log.entity';
import { HouseCupModule as CupModule } from './house-cup/house-cup.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HouseCup, PointLog]),
    PointLogsModule,
    CupModule,
  ],
  controllers: [],
  providers: [],
})
export class HouseCupModule {}
