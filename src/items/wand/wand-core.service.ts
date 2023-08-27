import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { WandCore } from './entities/wand-core.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class WandCoreService extends BasicService<
  WandCore,
  DeepPartial<WandCore>,
  QueryDeepPartialEntity<WandCore>
> {
  entityName = 'WandCore';
  constructor(
    @InjectRepository(WandCore) private readonly repo: Repository<WandCore>,
  ) {
    super(repo);
  }

  async updateOrCreate(input: DeepPartial<WandCore>) {
    const existing = await this.findOne({
      where: { identifier: input.identifier, guildId: input.guildId },
    });
    if (existing) {
      await this.update({ id: existing.id }, input);
      return this.findOne({
        where: { id: existing.id },
      });
    }
    const data = this.repo.create(input);
    return await this.repo.save(data);
  }
}
