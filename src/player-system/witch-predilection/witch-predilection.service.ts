import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { WitchPredilections } from './entities/witch-predilection.entity';
import {
  CreateWitchPredilectionsInput,
  UpdateWitchPredilectionsInput,
} from './entities/witch-predilection.input';

@Injectable()
export class WitchPredilectionsService {
  constructor(
    @InjectRepository(WitchPredilections)
    private readonly repo: Repository<WitchPredilections>,
  ) {}

  async create(input: CreateWitchPredilectionsInput) {
    const data = this.repo.create(input);
    const witchPredilections = await this.repo.save(data);
    return witchPredilections;
  }
  async update(
    where: FindOptionsWhere<WitchPredilections>,
    input: UpdateWitchPredilectionsInput,
  ) {
    const result = await this.repo.update(where, input);
    return result;
  }
  async delete() {}
  async findAll(options?: FindManyOptions<WitchPredilections>) {
    const witchPredilectionss = await this.repo.find(options);
    return witchPredilectionss;
  }
  async findOne(options: FindOneOptions<WitchPredilections>) {
    const witchPredilections = await this.repo.findOne(options);
    return witchPredilections;
  }
  async updateOrCreate(
    options: FindOneOptions<WitchPredilections>,
    input: UpdateWitchPredilectionsInput,
  ) {
    const existingWitchPredilections = await this.findOne(options);
    if (existingWitchPredilections) {
      const result = await this.update(
        { id: existingWitchPredilections.id },
        input,
      );
      return this.findOne(options);
    }
    const data = this.repo.create(input);
    return await this.repo.save(data);
  }
}
