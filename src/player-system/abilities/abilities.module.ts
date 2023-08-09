import { Module } from '@nestjs/common';
import { AbilitiesService } from './abilities.service';
import { AbilitiesResolver } from './abilities.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Abilities } from './entities/abilities.entity';
import {
  AbiliitesKnowledgesGroup,
  AbiliitesSkillsGroup,
  AbiliitesTalentsGroup,
  AbilitiesGroup,
} from './abiliites.group';

@Module({
  imports: [TypeOrmModule.forFeature([Abilities])],
  providers: [
    AbilitiesResolver,
    AbilitiesService,
    AbilitiesGroup,
    AbiliitesSkillsGroup,
    AbiliitesTalentsGroup,
    AbiliitesKnowledgesGroup,
  ],
  exports: [AbilitiesService],
})
export class AbilitiesModule {}
