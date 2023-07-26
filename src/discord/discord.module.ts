import { Global, Module, ConsoleLogger } from '@nestjs/common';
import { DiscordOptions } from './discord-options';
import { DiscordEventEmitter } from './discord.event-emitter';
import { GuildService } from '~/core/guild/guild.service';
import { CoreModule } from '~/core/core.module';

@Global()
@Module({
  imports: [CoreModule],
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
  exports: [],
})
export class DiscordModule { }
