import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { ResourceProvider } from './resource-provider.entity';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ResourceProviderService extends BasicService<
  ResourceProvider,
  DeepPartial<ResourceProvider>,
  QueryDeepPartialEntity<ResourceProvider>
> {
  constructor(
    @InjectRepository(ResourceProvider)
    private readonly repo: Repository<ResourceProvider>,
  ) {
    super(repo);
  }

  entityName = 'LootBox';
}
