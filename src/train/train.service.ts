import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  FindOneOptions,
  MoreThan,
  Not,
  IsNull,
  DeepPartial,
} from 'typeorm';
import { Train, TrainGroupOption } from './entities/train.entity';
import { CreateTrainInput, UpdateTrainInput } from './entities/train.input';
import { Spell, SpellDifficultyEnum } from '~/spell/entities/spell.entity';
import { BasicService } from '~/utils/basic.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class TrainService extends BasicService<
  Train,
  DeepPartial<Train>,
  QueryDeepPartialEntity<Train>
> {
  entityName = 'Treino';
  constructor(
    @InjectRepository(Train) private readonly repo: Repository<Train>,
  ) {
    super(repo);
  }
  async updateOrCreate(
    options: FindOneOptions<Train>,
    input: UpdateTrainInput,
  ) {
    const existingTrain = await this.findOne(options);
    if (existingTrain) {
      const result = await this.update({ id: existingTrain.id }, input);
      return this.findOne(options);
    }
    const data = this.repo.create(input);
    return await this.repo.save(data);
  }
}
