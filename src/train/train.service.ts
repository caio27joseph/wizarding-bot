import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  FindOneOptions,
} from 'typeorm';
import { Train, TrainGroupOption } from './entities/train.entity';
import { CreateTrainInput, UpdateTrainInput } from './entities/train.input';
import { SpellDifficultyEnum } from '~/spell/entities/spell.entity';

@Injectable()
export class TrainService {
  constructor(
    @InjectRepository(Train) private readonly repo: Repository<Train>,
  ) {}

  calculateXp(input: CreateTrainInput) {}
  async create(input: CreateTrainInput) {
    const data = this.repo.create(input);
    const train = await this.repo.save(data);
    return train;
  }
  async update(where: FindOptionsWhere<Train>, input: UpdateTrainInput) {
    const result = await this.repo.update(where, input);
    return result;
  }
  async delete() {}
  async findAll(options?: FindManyOptions<Train>) {
    const trains = await this.repo.find(options);
    return trains;
  }
  async findOne(options: FindOneOptions<Train>) {
    const train = await this.repo.findOne(options);
    return train;
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
