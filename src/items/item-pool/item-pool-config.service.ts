import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ItemPoolConfig } from './entitites/item-pool-config.entity';

@Injectable()
export class ItemPoolConfigService extends BasicService<
  ItemPoolConfig,
  DeepPartial<ItemPoolConfig>,
  QueryDeepPartialEntity<ItemPoolConfig>
> {
  entityName = 'ItemPoolConfig';
  constructor(
    @InjectRepository(ItemPoolConfig)
    private readonly repo: Repository<ItemPoolConfig>,
  ) {
    super(repo);
  }
}
