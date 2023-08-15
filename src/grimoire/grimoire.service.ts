import { Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { ExtrasService } from '~/player-system/extras/extras.service';
import { Grimoire } from './entities/grimoire.entity';
import {
  CreateGrimoireInput,
  UpdateGrimoireInput,
} from './entities/grimoire.input';
@Injectable()
export class GrimoireService {
  constructor(
    @InjectRepository(Grimoire) private readonly repo: Repository<Grimoire>,
  ) {}

  create(createGrimoireInput: CreateGrimoireInput) {
    const data = this.repo.create(createGrimoireInput);
    return this.repo.save(data);
  }

  findAll(options?: FindManyOptions<Grimoire>) {
    return this.repo.find(options);
  }

  findOne(options?: FindOneOptions<Grimoire>) {
    return this.repo.findOne(options);
  }

  update(
    options: FindOptionsWhere<Grimoire>,
    updateGrimoireInput: UpdateGrimoireInput,
  ) {
    return this.repo.update(options, updateGrimoireInput);
  }

  save(grimoire: Grimoire) {
    return this.repo.save(grimoire);
  }

  remove(options: FindOptionsWhere<Grimoire>) {
    return this.repo.delete(options);
  }

  async getOrCreate(
    options: FindOneOptions<Grimoire>,
    input: UpdateGrimoireInput,
  ) {
    const grimoire = await this.findOne(options);
    if (grimoire) {
      return grimoire;
    }
    const data = this.repo.create(input);
    return this.repo.save(data);
  }
}
