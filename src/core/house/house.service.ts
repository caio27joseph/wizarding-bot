import { Injectable } from '@nestjs/common';
import { CreateHouseInput, UpdateHouseInput } from './entities/house.input';
import { InjectRepository } from '@nestjs/typeorm';
import { House } from './entities/house.entity';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

@Injectable()
export class HouseService {
  constructor(
    @InjectRepository(House)
    private readonly repo: Repository<House>,
  ) {}

  create(createHouseInput: CreateHouseInput) {
    const data = this.repo.create(createHouseInput);
    return this.repo.save(data);
  }

  findAll(options?: FindManyOptions<House>) {
    return this.repo.find(options);
  }

  findOne(options?: FindOneOptions<House>) {
    return this.repo.findOne(options);
  }

  update(options: FindOptionsWhere<House>, updateHouseInput: UpdateHouseInput) {
    return this.repo.update(options, updateHouseInput);
  }

  remove(options: FindOptionsWhere<House>) {
    return this.repo.delete(options);
  }
}
