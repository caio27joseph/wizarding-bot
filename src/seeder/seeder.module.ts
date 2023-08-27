import { Module } from '@nestjs/common';
import { SeederProvider } from './seeder.provider';
import { SpellModule } from '~/spell/spell.module';
import { CoreModule } from '~/core/core.module';
import { GuildModule } from '~/core/guild/guild.module';
import { WandModule } from '~/items/wand/wand.module';

@Module({
  imports: [SpellModule, GuildModule, WandModule],
  providers: [SeederProvider],
})
export class SeederModule {}
