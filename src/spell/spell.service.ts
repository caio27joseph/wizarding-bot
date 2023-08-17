import { Injectable } from '@nestjs/common';
import { CreateSpellInput, UpdateSpellInput } from './entities/spell.input';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Spell } from './entities/spell.entity';
import { UpdateHouseInput } from '~/core/house/entities/house.input';
import { BasicService } from '~/utils/basic.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class SpellService extends BasicService<
  Spell,
  DeepPartial<Spell>,
  QueryDeepPartialEntity<Spell>
> {
  constructor(
    @InjectRepository(Spell)
    private repo: Repository<Spell>,
  ) {
    super(repo);
  }

  async updateOrCreate(input: UpdateSpellInput) {
    const existingSpell = await this.findOne({
      where: { identifier: input.identifier, guildId: input.guildId },
    });
    if (existingSpell) {
      await this.update({ id: existingSpell.id }, input);
      return this.findOne({
        where: { id: existingSpell.id },
      });
    }
    const data = this.repo.create(input);
    return await this.repo.save(data);
  }
}
