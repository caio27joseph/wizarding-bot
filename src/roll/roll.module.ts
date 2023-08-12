import { Module } from '@nestjs/common';
import { RollService } from './roll.service';
import { Rolls10Group } from './rolls10.group';
import { AbilitiesModule } from '~/player-system/abilities/abilities.module';
import { AttributeModule } from '~/player-system/attribute/attribute.module';
import { CompetencesModule } from '~/player-system/competences/competences.module';
import { NonConvPredilectionsModule } from '~/player-system/nonconv-predilection/noconv-predilections.module';
import { WitchPredilectionsModule } from '~/player-system/witch-predilection/witch-predilection.module';
import { ExtrasModule } from '~/player-system/extras/extras.module';

@Module({
  imports: [
    AttributeModule,
    AbilitiesModule,
    CompetencesModule,
    WitchPredilectionsModule,
    NonConvPredilectionsModule,
    ExtrasModule,
  ],
  providers: [RollService, Rolls10Group],
  exports: [RollService],
})
export class RollModule {}
