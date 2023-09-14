import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { Shop } from './entities/shop.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class ShopService extends BasicService<
  Shop,
  DeepPartial<Shop>,
  QueryDeepPartialEntity<Shop>
> {
  entityName = 'Shop';
  constructor(@InjectRepository(Shop) private readonly repo: Repository<Shop>) {
    super(repo);
  }
}
