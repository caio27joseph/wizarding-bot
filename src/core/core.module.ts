import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './core.entity';
import { PlayerGroup } from './player.group';
import { GuildGroup } from './guild/guild.group';
import { GuildService } from './guild/guild.service';
import { HouseService } from './house/house.service';
import { House } from './house/house.entity';
import { Guild } from './guild/guild.entity';
import { PlayerService } from './player/player.service';
import { HouseGroup } from './house/house.group';

@Module({
  imports: [TypeOrmModule.forFeature([Player, House, Guild])],
  controllers: [],
  providers: [
    CoreService,
    PlayerGroup,
    PlayerService,
    GuildGroup,
    GuildService,
    HouseService,
    HouseGroup,
  ],
  exports: [GuildService, PlayerService],
})
export class CoreModule {}
