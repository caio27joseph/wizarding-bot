import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Player } from '~/core/player/entities/player.entity';

export abstract class BasicService<
  Entity,
  CreateEntityInput extends DeepPartial<Entity>,
  UpdateEntityInput extends QueryDeepPartialEntity<Entity>,
> {
  constructor(private readonly __repo: Repository<Entity>) {}

  save(slot: Entity): any {
    return this.__repo.save(slot);
  }

  create(input: CreateEntityInput) {
    const data = this.__repo.create(input as Entity);
    return this.__repo.save(data);
  }

  findAll(options?: FindManyOptions<Entity>) {
    return this.__repo.find(options);
  }

  findOne(options?: FindOneOptions<Entity>) {
    return this.__repo.findOne(options);
  }

  update(options: FindOptionsWhere<Entity>, input: UpdateEntityInput) {
    return this.__repo.update(options, input);
  }

  remove(options: FindOptionsWhere<Entity>) {
    return this.__repo.delete(options);
  }
}
