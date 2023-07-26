import { Module } from '@nestjs/common';
import { HouseCupService } from './house-cup.service';
import { HouseCupGroup } from './house-cup.group';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseCup, PointLog } from './house-cup.entity';
import { CoreModule } from '~/core/core.module';

@Module({
  imports: [TypeOrmModule.forFeature([HouseCup, PointLog]), CoreModule],
  controllers: [],
  providers: [HouseCupService, HouseCupGroup],
})
export class HouseCupModule {}
