import { Injectable } from '@nestjs/common';
import { CreateSpellInput, UpdateSpellInput } from './entities/spell.input';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Spell } from './entities/spell.entity';
import { UpdateHouseInput } from '~/core/house/entities/house.input';

@Injectable()
export class SpellService {
  constructor(
    @InjectRepository(Spell)
    private repo: Repository<Spell>,
  ) {}
  async create(input: CreateSpellInput) {
    const data = this.repo.create(input);
    const spell = await this.repo.save(data);
    return spell;
  }
  async update(where: FindOptionsWhere<Spell>, input: UpdateSpellInput) {
    const result = await this.repo.update(where, input);
    return result;
  }
  async delete() {}
  async findAll(options?: FindManyOptions<Spell>) {
    const spells = await this.repo.find(options);
    return spells;
  }
  async findOne(options: FindOneOptions<Spell>) {
    const spell = await this.repo.findOne(options);
    return spell;
  }
  async updateOrCreate(input: UpdateSpellInput) {
    const existingSpell = await this.findOne({
      where: { identifier: input.identifier, guildId: input.guildId },
    });

    if (existingSpell) {
      return this.update({ id: existingSpell.id }, input);
    }
    return this.repo.save(input);
  }
}
