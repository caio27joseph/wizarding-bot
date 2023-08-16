import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { Item } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
@Injectable()
export class ItemService extends BasicService<
  Item,
  DeepPartial<Item>,
  QueryDeepPartialEntity<Item>
> {
  constructor(@InjectRepository(Item) private readonly repo: Repository<Item>) {
    super(repo);
  }
}
