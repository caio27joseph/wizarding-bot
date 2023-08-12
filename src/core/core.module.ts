import { Module, forwardRef } from '@nestjs/common';
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
import { DiscordModule } from '~/discord/discord.module';
import { GuildModule } from './guild/guild.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, House]),
    HouseModule,
    PlayerModule,
    GuildModule,
  ],
  controllers: [],
  providers: [CoreService, PlayerGroup, HouseGroup],
  exports: [PlayerModule],
})
export class CoreModule {}
