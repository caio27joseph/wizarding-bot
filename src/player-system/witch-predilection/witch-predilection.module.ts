import { Module } from '@nestjs/common';
import { WitchPredilectionsResolver } from './witch-predilection.resolver';
import { PlayerModule } from '~/core/player/player.module';
import { WitchPredilectionsGroup } from './witch-predilection.group';
import { WitchPredilectionsService } from './witch-predilection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WitchPredilection } from './entities/witch-predilection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WitchPredilection]), PlayerModule],
  providers: [
    WitchPredilectionsResolver,
    WitchPredilectionsService,
    WitchPredilectionsGroup,
  ],
  exports: [WitchPredilectionsService],
})
export class WitchPredilectionsModule {}
