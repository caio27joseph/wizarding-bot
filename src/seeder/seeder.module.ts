import { Module } from '@nestjs/common';
import { SeederProvider } from './seeder.provider';
import { SpellModule } from '~/spell/spell.module';
import { CoreModule } from '~/core/core.module';

@Module({
  imports: [SpellModule, CoreModule],
  providers: [SeederProvider],
})
export class SeederModule {}
