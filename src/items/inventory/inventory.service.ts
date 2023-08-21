import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { Inventory } from './entities/inventory.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class InventoryService extends BasicService<
  Inventory,
  DeepPartial<Inventory>,
  QueryDeepPartialEntity<Inventory>
> {
  entityName = 'Inventory';
  constructor(
    @InjectRepository(Inventory) private readonly repo: Repository<Inventory>,
  ) {
    super(repo);
  }
}
