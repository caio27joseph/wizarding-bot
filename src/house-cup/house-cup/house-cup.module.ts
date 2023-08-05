import { Module, forwardRef } from '@nestjs/common';
import { HouseCupService } from './house-cup.service';
import { HouseCupResolver } from './house-cup.resolver';
import { HouseCupGroup } from './house-cup.group';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseCup } from './entities/house-cup.entity';
import { CoreModule } from '~/core/core.module';
import { PointLogsModule } from '../point-logs/point-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HouseCup]),
    CoreModule,
    forwardRef(() => PointLogsModule),
  ],
  providers: [HouseCupResolver, HouseCupService, HouseCupGroup],
  exports: [HouseCupService],
})
export class HouseCupModule {}
