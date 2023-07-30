import { Module } from '@nestjs/common';
import { PointLogsService } from './point-logs.service';
import { PointLogsResolver } from './point-logs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointLog } from './entities/point-log.entity';
import { HouseCup } from '../house-cup/entities/house-cup.entity';
import { HouseCupService } from '../house-cup/house-cup.service';
import { CoreModule } from '~/core/core.module';

@Module({
  imports: [TypeOrmModule.forFeature([PointLog, HouseCup]), CoreModule],
  providers: [PointLogsResolver, PointLogsService, HouseCupService],
  exports: [PointLogsService],
})
export class PointLogsModule {}
