import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { Stack } from './entities/stack.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class StackService extends BasicService<
  Stack,
  DeepPartial<Stack>,
  QueryDeepPartialEntity<Stack>
> {
  entityName = 'Stack';
  constructor(
    @InjectRepository(Stack) private readonly repo: Repository<Stack>,
  ) {
    super(repo);
  }
}
