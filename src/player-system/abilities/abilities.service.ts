import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Abilities } from './entities/abilities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import {
  CreateAbilitiesInput,
  UpdateAbilitiesInput,
} from './entities/abilities.input';

@Injectable()
export class AbilitiesService {
  constructor(
    @InjectRepository(Abilities) private readonly repo: Repository<Abilities>,
  ) {}

  async create(input: CreateAbilitiesInput) {
    const data = this.repo.create(input);
    const abilities = await this.repo.save(data);
    return abilities;
  }
  async update(
    where: FindOptionsWhere<Abilities>,
    input: UpdateAbilitiesInput,
  ) {
    const result = await this.repo.update(where, input);
    return result;
  }
  async delete() {}
  async findAll(options?: FindManyOptions<Abilities>) {
    const abilitiess = await this.repo.find(options);
    return abilitiess;
  }
  async findOne(options: FindOneOptions<Abilities>) {
    const abilities = await this.repo.findOne(options);
    return abilities;
  }
  async updateOrCreate(
    options: FindOneOptions<Abilities>,
    input: UpdateAbilitiesInput,
  ) {
    const existingAbilities = await this.findOne(options);
    if (existingAbilities) {
      const result = await this.update({ id: existingAbilities.id }, input);
      return this.findOne(options);
    }
    const data = this.repo.create(input);
    return await this.repo.save(data);
  }
}
