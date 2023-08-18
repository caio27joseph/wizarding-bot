import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { ExtrasService } from '~/player-system/extras/extras.service';
import { Grimoire } from './entities/grimoire.entity';
import {
  CreateGrimoireInput,
  UpdateGrimoireInput,
} from './entities/grimoire.input';
import { BasicService } from '~/utils/basic.service';
import { QueryPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
@Injectable()
export class GrimoireService extends BasicService<
  Grimoire,
  DeepPartial<Grimoire>,
  QueryPartialEntity<Grimoire>
> {
  entityName = 'Grimório';
  constructor(
    @InjectRepository(Grimoire) private readonly repo: Repository<Grimoire>,
  ) {
    super(repo);
  }

  async getOrCreate(
    options: FindOneOptions<Grimoire>,
    input: DeepPartial<Grimoire>,
  ) {
    const grimoire = await this.findOne(options);
    if (grimoire) {
      return grimoire;
    }
    const data = this.repo.create(input);
    return this.repo.save(data);
  }
}
