import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Extras } from './entities/extras.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CreateExtrasInput, UpdateExtrasInput } from './entities/extras.input';

@Injectable()
export class ExtrasService {
  constructor(
    @InjectRepository(Extras) private readonly repo: Repository<Extras>,
  ) {}

  async create(input: CreateExtrasInput) {
    const data = this.repo.create(input);
    const extras = await this.repo.save(data);
    return extras;
  }
  async update(where: FindOptionsWhere<Extras>, input: UpdateExtrasInput) {
    const result = await this.repo.update(where, input);
    return result;
  }
  async delete() {}
  async findAll(options?: FindManyOptions<Extras>) {
    const extrass = await this.repo.find(options);
    return extrass;
  }
  async findOne(options: FindOneOptions<Extras>) {
    const extras = await this.repo.findOne(options);
    return extras;
  }
  async updateOrCreate(
    options: FindOneOptions<Extras>,
    input: UpdateExtrasInput,
  ) {
    const existingExtras = await this.findOne(options);
    if (existingExtras) {
      const result = await this.update({ id: existingExtras.id }, input);
      return this.findOne(options);
    }
    const data = this.repo.create(input);
    return await this.repo.save(data);
  }
}
