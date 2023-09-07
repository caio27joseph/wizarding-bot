import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { LearnLog } from './entities/learn-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  IsNull,
  LessThan,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class LearnLogService extends BasicService<
  LearnLog,
  DeepPartial<LearnLog>,
  QueryDeepPartialEntity<LearnLog>
> {
  entityName = 'Log de Aprendizado';
  constructor(
    @InjectRepository(LearnLog) private readonly repo: Repository<LearnLog>,
  ) {
    super(repo);
  }

  async todayLogs(playerId: string) {
    const now = new Date();
    const today6am = new Date(now);
    today6am.setHours(9, 0, 0, 0);

    let startTime: Date;
    if (now < today6am) {
      startTime = new Date(today6am.getTime() - 24 * 60 * 60 * 1000);
    } else {
      startTime = today6am;
    }
    const logs = await this.findAll({
      where: {
        player: {
          id: playerId,
        },
        createdAt: MoreThan(startTime),
        spell: { id: Not(IsNull()) },
      },
    });
    return logs;
  }
}
