import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseModule } from './house/house.module';
import { House } from './house/entities/house.entity';
import { PlayerModule } from './player/player.module';
import { GuildModule } from './guild/guild.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([House]),
    HouseModule,
    GuildModule,
    PlayerModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CoreModule {}
