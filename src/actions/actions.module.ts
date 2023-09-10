import { Module } from '@nestjs/common';
import { SearchModule } from './search/search.module';
import { UseModule } from './use/use.module';
import { FishModule } from './fish/fish.module';

@Module({
  imports: [SearchModule, UseModule, FishModule],
})
export class ActionsModule {}
