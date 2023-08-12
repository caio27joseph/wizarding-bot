import { Global, Module, ConsoleLogger, forwardRef } from '@nestjs/common';
import { DiscordOptions } from './discord-options';
import { DiscordEventEmitter } from './discord.event-emitter';
import { GuildService } from '~/core/guild/guild.service';
import { CoreModule } from '~/core/core.module';
import { GuildModule } from '~/core/guild/guild.module';
import { PlayerModule } from '~/core/player/player.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from '~/core/guild/guild.entity';

@Global()
@Module({
  imports: [
    PlayerModule,
    TypeOrmModule.forFeature([Guild]),
    forwardRef(() => GuildModule),
  ],
  controllers: [],
  providers: [
    ConsoleLogger,
    {
      provide: DiscordOptions,
      useValue: {
        token: process.env.DISCORD_TOKEN,
        prefix: process.env.DISCORD_PREFIX || '!',
      },
    },
    DiscordEventEmitter,
  ],
  exports: [DiscordEventEmitter],
})
export class DiscordModule {}
