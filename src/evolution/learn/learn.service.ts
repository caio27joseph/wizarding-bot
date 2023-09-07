import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { Learn } from './entities/learn.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class LearnService extends BasicService<
  Learn,
  DeepPartial<Learn>,
  QueryDeepPartialEntity<Learn>
> {
  entityName = 'Aprendizado';
  constructor(
    @InjectRepository(Learn) private readonly repo: Repository<Learn>,
  ) {
    super(repo);
  }
}
