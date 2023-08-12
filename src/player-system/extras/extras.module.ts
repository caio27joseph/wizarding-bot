import { Module } from '@nestjs/common';
import { ExtrasResolver } from './extras.resolver';
import { PlayerModule } from '~/core/player/player.module';
import { ExtrasGroup } from './extras.group';
import { ExtrasService } from './extras.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Extras } from './entities/extras.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Extras]), PlayerModule],
  providers: [ExtrasResolver, ExtrasService, ExtrasGroup],
  exports: [ExtrasService],
})
export class ExtrasModule {}
