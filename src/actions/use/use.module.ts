import { Module } from '@nestjs/common';
import { UseGroup } from './use.group';
import { SpellModule } from '~/spell/spell.module';
import { PlayerModule } from '~/core/player/player.module';
import { RollModule } from '~/roll/roll.module';

@Module({
  imports: [SpellModule, PlayerModule, RollModule],
  providers: [UseGroup],
})
export class UseModule {}
