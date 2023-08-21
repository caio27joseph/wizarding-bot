import { Module } from '@nestjs/common';
import { PlayerSetService } from './player-set.service';

@Module({
  providers: [PlayerSetService]
})
export class PlayerSetModule {}
