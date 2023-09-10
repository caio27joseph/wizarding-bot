import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ItemPool } from './entitites/item-pool.entity';

@Injectable()
export class ItemPoolService extends BasicService<
  ItemPool,
  DeepPartial<ItemPool>,
  QueryDeepPartialEntity<ItemPool>
> {
  entityName = 'ItemPool';
  constructor(
    @InjectRepository(ItemPool) private readonly repo: Repository<ItemPool>,
  ) {
    super(repo);
  }
}
