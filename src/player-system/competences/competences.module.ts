import { Module } from '@nestjs/common';
import { CompetencesResolver } from './competences.resolver';
import { PlayerModule } from '~/core/player/player.module';
import { CompetencesGroup } from './competences.group';
import { CompetencesService } from './competences.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competences } from './entities/competences.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Competences]), PlayerModule],
  providers: [CompetencesResolver, CompetencesService, CompetencesGroup],
  exports: [CompetencesService],
})
export class CompetencesModule {}
