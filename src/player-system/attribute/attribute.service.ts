import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Attributes } from './entities/attributes.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import {
  CreateAttributesInput,
  UpdateAttributesInput,
} from './entities/attributes.input';

@Injectable()
export class AttributeService {
  constructor(
    @InjectRepository(Attributes) private readonly repo: Repository<Attributes>,
  ) {}

  async create(input: CreateAttributesInput) {
    const data = this.repo.create(input);
    const attributes = await this.repo.save(data);
    return attributes;
  }
  async update(
    where: FindOptionsWhere<Attributes>,
    input: UpdateAttributesInput,
  ) {
    const result = await this.repo.update(where, input);
    return result;
  }
  async delete() {}
  async findAll(options?: FindManyOptions<Attributes>) {
    const attributess = await this.repo.find(options);
    return attributess;
  }
  async findOne(options: FindOneOptions<Attributes>) {
    const attributes = await this.repo.findOne(options);
    return attributes;
  }
  async updateOrCreate(
    options: FindOneOptions<Attributes>,
    input: UpdateAttributesInput,
  ) {
    const existingAttributes = await this.findOne(options);
    if (existingAttributes) {
      const result = await this.update({ id: existingAttributes.id }, input);
      return this.findOne(options);
    }
    const data = this.repo.create(input);
    return await this.repo.save(data);
  }
}
