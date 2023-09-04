import { Module } from '@nestjs/common';
import { SearchModule } from './search/search.module';
import { UseModule } from './use/use.module';

@Module({
  imports: [SearchModule, UseModule]
})
export class ActionsModule {}
