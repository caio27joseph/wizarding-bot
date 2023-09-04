import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { MagicSchool } from './entities/witch-predilection.entity';
import {
  CreateMagicSchoolInput,
  UpdateMagicSchoolInput,
} from './entities/witch-predilection.input';

@Injectable()
export class WitchPredilectionsService {
  constructor(
    @InjectRepository(MagicSchool)
    private readonly repo: Repository<MagicSchool>,
  ) {}

  async create(input: CreateMagicSchoolInput) {
    const data = this.repo.create(input);
    const witchPredilections = await this.repo.save(data);
    return witchPredilections;
  }
  async update(
    where: FindOptionsWhere<MagicSchool>,
    input: UpdateMagicSchoolInput,
  ) {
    const result = await this.repo.update(where, input);
    return result;
  }
  async delete() {}
  async findAll(options?: FindManyOptions<MagicSchool>) {
    const witchPredilectionss = await this.repo.find(options);
    return witchPredilectionss;
  }
  async findOne(options: FindOneOptions<MagicSchool>) {
    const witchPredilections = await this.repo.findOne(options);
    return witchPredilections;
  }
  async updateOrCreate(
    options: FindOneOptions<MagicSchool>,
    input: UpdateMagicSchoolInput,
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
