import { Module } from '@nestjs/common';
import { AttributeModule } from './attribute/attribute.module';
import { AbilitiesModule } from './abilities/abilities.module';
import { WitchPredilectionsModule } from './witch-predilection/witch-predilection.module';
import { NonConvPredilectionsModule } from './nonconv-predilection/noconv-predilections.module';
import { ExtrasModule } from './extras/extras.module';

@Module({
  imports: [
    AttributeModule,
    NonConvPredilectionsModule,
    AbilitiesModule,
    WitchPredilectionsModule,
    ExtrasModule,
  ],
})
export class PlayerSystemModule {}
