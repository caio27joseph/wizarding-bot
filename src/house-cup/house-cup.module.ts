import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseCup } from './house-cup/entities/house-cup.entity';
import { PointLogsModule } from './point-logs/point-logs.module';
import { HouseCupModule as CupModule } from './house-cup/house-cup.module';

@Module({
  imports: [TypeOrmModule.forFeature([HouseCup]), PointLogsModule, CupModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class HouseCupModule {}
