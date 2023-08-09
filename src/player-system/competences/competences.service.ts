import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Competences } from './entities/competences.entity';
import {
  CreateCompetencesInput,
  UpdateCompetencesInput,
} from './entities/competences.input';

@Injectable()
export class CompetencesService {
  constructor(
    @InjectRepository(Competences)
    private readonly repo: Repository<Competences>,
  ) {}

  async create(input: CreateCompetencesInput) {
    const data = this.repo.create(input);
    const competences = await this.repo.save(data);
    return competences;
  }
  async update(
    where: FindOptionsWhere<Competences>,
    input: UpdateCompetencesInput,
  ) {
    const result = await this.repo.update(where, input);
    return result;
  }
  async delete() {}
  async findAll(options?: FindManyOptions<Competences>) {
    const competencess = await this.repo.find(options);
    return competencess;
  }
  async findOne(options: FindOneOptions<Competences>) {
    const competences = await this.repo.findOne(options);
    return competences;
  }
  async updateOrCreate(
    options: FindOneOptions<Competences>,
    input: UpdateCompetencesInput,
  ) {
    const existingCompetences = await this.findOne(options);
    if (existingCompetences) {
      const result = await this.update({ id: existingCompetences.id }, input);
      return this.findOne(options);
    }
    const data = this.repo.create(input);
    return await this.repo.save(data);
  }
}
