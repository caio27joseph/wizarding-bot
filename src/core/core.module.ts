import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerGroup } from './player/player.group';
import { GuildGroup } from './guild/guild.group';
import { GuildService } from './guild/guild.service';
import { Guild } from './guild/guild.entity';
import { HouseGroup } from './house/house.group';
import { HouseModule } from './house/house.module';
import { House } from './house/entities/house.entity';
import { PlayerModule } from './player/player.module';
import { Player } from './player/entities/player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, House, Guild]),
    HouseModule,
    PlayerModule,
  ],
  controllers: [],
  providers: [CoreService, PlayerGroup, GuildGroup, GuildService, HouseGroup],
  exports: [GuildService, PlayerModule],
})
export class CoreModule {}
