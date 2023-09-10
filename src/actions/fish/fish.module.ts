import { Module } from '@nestjs/common';
import { FishGroup } from './fish.group';
import { ResourceProviderModule } from '~/items/resource-provider/resource-provider.module';

@Module({
  imports: [ResourceProviderModule],
  providers: [FishGroup],
})
export class FishModule {}
