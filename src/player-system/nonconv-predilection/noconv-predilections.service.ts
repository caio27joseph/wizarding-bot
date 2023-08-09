import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { NonConvPredilections } from './entities/nonconv-predilections.entity';
import {
  CreateNonConvPredilectionsInput,
  UpdateNonConvPredilectionsInput,
} from './entities/nonconv-predilections.input';

@Injectable()
export class NonConvPredilectionsService {
  constructor(
    @InjectRepository(NonConvPredilections)
    private readonly repo: Repository<NonConvPredilections>,
  ) {}

  async create(input: CreateNonConvPredilectionsInput) {
    const data = this.repo.create(input);
    const competences = await this.repo.save(data);
    return competences;
  }
  async update(
    where: FindOptionsWhere<NonConvPredilections>,
    input: UpdateNonConvPredilectionsInput,
  ) {
    const result = await this.repo.update(where, input);
    return result;
  }
  async delete() {}
  async findAll(options?: FindManyOptions<NonConvPredilections>) {
    const competencess = await this.repo.find(options);
    return competencess;
  }
  async findOne(options: FindOneOptions<NonConvPredilections>) {
    const competences = await this.repo.findOne(options);
    return competences;
  }
  async updateOrCreate(
    options: FindOneOptions<NonConvPredilections>,
    input: UpdateNonConvPredilectionsInput,
  ) {
    const existingNonConvPredilection = await this.findOne(options);
    if (existingNonConvPredilection) {
      const result = await this.update(
        { id: existingNonConvPredilection.id },
        input,
      );
      return this.findOne(options);
    }
    const data = this.repo.create(input);
    return await this.repo.save(data);
  }
}
