import { Module } from '@nestjs/common';
import { TrainModule } from './train/train.module';
import { LearnModule } from './learn/learn.module';

@Module({
  imports: [TrainModule, LearnModule],
})
export class EvolutionModule {}
