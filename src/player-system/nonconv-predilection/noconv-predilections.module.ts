import { Module } from '@nestjs/common';
import { NonConvPredilectionsResolver } from './noconv-predilections.resolver';
import { PlayerModule } from '~/core/player/player.module';
import { NonConvPredilectionsGroup } from './noconv-predilections.group';
import { NonConvPredilectionsService } from './noconv-predilections.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NonConvPredilections } from './entities/nonconv-predilections.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NonConvPredilections])],
  providers: [
    NonConvPredilectionsResolver,
    NonConvPredilectionsService,
    NonConvPredilectionsGroup,
  ],
})
export class NonConvPredilectionsModule {}
