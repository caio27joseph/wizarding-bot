import { Module } from '@nestjs/common';
import { SearchGroup } from './search.group';
import { ResourceProviderModule } from '~/items/resource-provider/resource-provider.module';

@Module({
  imports: [ResourceProviderModule],
  providers: [SearchGroup],
})
export class SearchModule {}
