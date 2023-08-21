import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerResolver } from './player.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { HouseModule } from '../house/house.module';
import { PlayerGroup } from './player.group';
import { GuildModule } from '../guild/guild.module';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), HouseModule],
  providers: [PlayerResolver, PlayerService, PlayerGroup],
  exports: [PlayerService],
})
export class PlayerModule {}
