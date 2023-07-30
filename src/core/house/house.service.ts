import { Injectable } from '@nestjs/common';
import { CreateHouseInput, UpdateHouseInput } from './entities/house.input';
import { InjectRepository } from '@nestjs/typeorm';
import { House } from './entities/house.entity';
import { FindManyOptions, Repository } from 'typeorm';

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

  findOne(id: number) {
    return `This action returns a #${id} house`;
  }

  update(id: number, updateHouseInput: UpdateHouseInput) {
    return `This action updates a #${id} house`;
  }

  remove(id: number) {
    return `This action removes a #${id} house`;
  }
}
