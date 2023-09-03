import { Module } from '@nestjs/common';
import { AbilitiesService } from './abilities.service';
import { AbilitiesResolver } from './abilities.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Abilities } from './entities/abilities.entity';
import {
  Abiliites1Group,
  Abiliites2Group,
  Abiliites3Group,
  AbilitiesGroup,
} from './abiliites.group';

@Module({
  imports: [TypeOrmModule.forFeature([Abilities])],
  providers: [
    AbilitiesResolver,
    AbilitiesService,
    AbilitiesGroup,
    Abiliites1Group,
    Abiliites2Group,
    Abiliites3Group,
  ],
  exports: [AbilitiesService],
})
export class AbilitiesModule {}
