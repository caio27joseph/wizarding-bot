import { Module, forwardRef } from '@nestjs/common';
import { PlayerModule } from '~/core/player/player.module';
import { SpellModule } from '~/spell/spell.module';
import { LearnGroup } from './learn.group';
import { LearnService } from './learn.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Learn } from './entities/learn.entity';
import { GrimoireService } from '~/grimoire/grimoire.service';
import { GrimoireModule } from '~/grimoire/grimoire.module';
import { LearnLog } from './entities/learn-log.entity';
import { LearnLogService } from './learn-log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Learn, LearnLog]),
    forwardRef(() => SpellModule),
    PlayerModule,
    GrimoireModule,
  ],
  providers: [LearnGroup, LearnService, LearnLogService],
  exports: [LearnService, LearnLogService],
})
export class LearnModule {}
