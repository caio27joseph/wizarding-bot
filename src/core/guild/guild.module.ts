import { Module, forwardRef } from '@nestjs/common';
import { Guild } from './guild.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildService } from './guild.service';
import { GuildGroup } from './guild.group';
import { DiscordModule } from '~/discord/discord.module';

@Module({
  imports: [TypeOrmModule.forFeature([Guild]), forwardRef(() => DiscordModule)],
  providers: [GuildGroup, GuildService],
  exports: [GuildService],
})
export class GuildModule {}
