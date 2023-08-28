import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PlayerChangeLog } from './entities/player-change-log.entity';

@Injectable()
export class PlayerChangeLogService extends BasicService<
  PlayerChangeLog,
  DeepPartial<PlayerChangeLog>,
  QueryDeepPartialEntity<PlayerChangeLog>
> {
  entityName = 'PlayerChangeLog';
  constructor(
    @InjectRepository(PlayerChangeLog)
    private readonly repo: Repository<PlayerChangeLog>,
  ) {
    super(repo);
  }
}
