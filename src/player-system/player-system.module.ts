import { Module } from '@nestjs/common';
import { AttributeModule } from './attribute/attribute.module';
import { AbilitiesModule } from './abilities/abilities.module';
import { CompetencesModule } from './competences/competences.module';
import { WitchPredilectionsModule } from './witch-predilection/witch-predilection.module';

@Module({
  imports: [
    AttributeModule,
    AbilitiesModule,
    CompetencesModule,
    WitchPredilectionsModule,
  ],
})
export class PlayerSystemModule {}
