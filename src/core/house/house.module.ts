import { Module } from '@nestjs/common';
import { HouseService } from './house.service';
import { HouseResolver } from './house.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House } from './entities/house.entity';
import { HouseGroup } from './house.group';
import { GuildModule } from '../guild/guild.module';

@Module({
  imports: [TypeOrmModule.forFeature([House]), GuildModule],
  providers: [HouseResolver, HouseService, HouseGroup],
  exports: [HouseService],
})
export class HouseModule {}
