import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerResolver } from './player.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { HouseModule } from '../house/house.module';
import { PlayerGroup } from './player.group';
import { GuildModule } from '../guild/guild.module';
import { PlayerXPGroup } from './player-xp.group';
import { PlayerTargetGroup } from './player-target.group';
import { PlayerChangeLogService } from './player-change-log.service';
import { PlayerChangeLog } from './entities/player-change-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, PlayerChangeLog]), HouseModule],
  providers: [
    PlayerResolver,
    PlayerService,
    PlayerGroup,
    PlayerTargetGroup,
    PlayerXPGroup,
    PlayerChangeLogService,
  ],
  exports: [PlayerService, PlayerChangeLogService],
})
export class PlayerModule {}
