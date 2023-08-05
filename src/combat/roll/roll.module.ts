import { Module } from '@nestjs/common';
import { RollService } from './roll.service';
import { RollResolver } from './roll.resolver';

@Module({
  providers: [RollResolver, RollService],
})
export class RollModule {}
