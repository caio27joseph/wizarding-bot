import { Module } from '@nestjs/common';
import { GrimoireMenu } from './grimoire.menu';

@Module({
  providers: [GrimoireMenu],
  exports: [GrimoireMenu],
})
export class GrimoireModule {}
