import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { HouseCupModule } from './house-cup/house-cup.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule,
    CoreModule,
    DatabaseModule,
    HouseCupModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
