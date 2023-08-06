import { Injectable } from '@nestjs/common';
import { CreateSpellInput, UpdateSpellInput } from './entities/spell.input';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
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
  async findAll() {}
  async findOne() {}
}
