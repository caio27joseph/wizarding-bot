import { Module } from '@nestjs/common';
import { AttributeModule } from './attribute/attribute.module';
import { AbilitiesModule } from './abilities/abilities.module';
import { CompetencesModule } from './competences/competences.module';

@Module({
  imports: [AttributeModule, AbilitiesModule, CompetencesModule],
})
export class PlayerSystemModule {}
