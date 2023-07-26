import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './core.entity';
import { PlayerDiscordService } from './player.discord_service';
import { GuildGroup } from './guild/guild.group';
import { GuildService } from './guild/guild.service';
import { HouseService } from './house/house.service';
import { House } from './house/house.entity';
import { Guild } from './guild/guild.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, House, Guild])],
  controllers: [],
  providers: [
    CoreService,
    PlayerDiscordService,
    GuildGroup,
    GuildService,
    HouseService,
  ],
  exports: [GuildService],
})
export class CoreModule {}
