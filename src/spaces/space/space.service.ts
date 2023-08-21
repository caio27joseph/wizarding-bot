import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { Space } from './entities/space.entity';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';
import { QueryPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SpaceService extends BasicService<
  Space,
  DeepPartial<Space>,
  QueryPartialEntity<Space>
> {
  entityName = 'Local';

  constructor(
    @InjectRepository(Space)
    private readonly repo: Repository<Space>,
  ) {
    super(repo);
  }

  async getOrCreate(options: FindOneOptions<Space>, input: DeepPartial<Space>) {
    const grimoire = await this.findOne(options);
    if (grimoire) {
      return grimoire;
    }
    const data = this.repo.create(input);
    const entity = await this.repo.save(data);
    return entity;
  }
}
