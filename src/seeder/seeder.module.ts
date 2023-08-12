import { Module } from '@nestjs/common';
import { SeederProvider } from './seeder.provider';
import { SpellModule } from '~/spell/spell.module';
import { CoreModule } from '~/core/core.module';
import { GuildModule } from '~/core/guild/guild.module';

@Module({
  imports: [SpellModule, GuildModule],
  providers: [SeederProvider],
})
export class SeederModule {}
