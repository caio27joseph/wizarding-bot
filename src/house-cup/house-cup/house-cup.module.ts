import { ConsoleLogger, Module, forwardRef } from '@nestjs/common';
import { HouseCupService } from './house-cup.service';
import { HouseCupResolver } from './house-cup.resolver';
import { HouseCupGroup } from './house-cup.group';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseCup } from './entities/house-cup.entity';
import { CoreModule } from '~/core/core.module';
import { PointLogsModule } from '../point-logs/point-logs.module';
import { HouseModule } from '~/core/house/house.module';
import { CupShowCaseService } from './cup-show-case.service';
import { CupShowCase } from './entities/cup-show-case.entity';
import { DiscordModule } from '~/discord/discord.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HouseCup, CupShowCase]),
    CoreModule,
    forwardRef(() => PointLogsModule),
    HouseModule,
    DiscordModule,
  ],
  providers: [
    HouseCupResolver,
    ConsoleLogger,
    HouseCupService,
    HouseCupGroup,
    CupShowCaseService,
  ],
  exports: [HouseCupService],
})
export class HouseCupModule {}
