import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { ItemDrop } from './entities/item-drop.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class ItemDropService extends BasicService<
  ItemDrop,
  DeepPartial<ItemDrop>,
  QueryDeepPartialEntity<ItemDrop>
> {
  entityName = 'ItemDrop';
  constructor(
    @InjectRepository(ItemDrop) private readonly repo: Repository<ItemDrop>,
  ) {
    super(repo);
  }
}
