import { Module, forwardRef } from '@nestjs/common';
import { SpellService } from './spell.service';
import { SpellResolver } from './spell.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spell } from './entities/spell.entity';
import { TrainModule } from '~/evolution/train/train.module';
import { PlayerModule } from '~/core/player/player.module';
import { GrimoireModule } from '~/grimoire/grimoire.module';
import { SpellMenuGroup } from './spell.menu.group';
import { LearnModule } from '~/evolution/learn/learn.module';
import { SpellModGroup } from './spell-mod.group';

@Module({
  imports: [
    TypeOrmModule.forFeature([Spell]),
    TrainModule,
    PlayerModule,
    GrimoireModule,
    forwardRef(() => LearnModule),
  ],
  providers: [SpellResolver, SpellService, SpellMenuGroup, SpellModGroup],
  exports: [SpellService],
})
export class SpellModule {}
