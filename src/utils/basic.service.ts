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
  abstract entityName;
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

  async findOneOrFail(options?: FindOneOptions<Entity>) {
    const data = await this.__repo.findOne(options);
    if (!data) {
      throw new Error(this.entityName + ' não encontrado');
    }
    return data;
  }

  update(options: FindOptionsWhere<Entity>, input: UpdateEntityInput) {
    return this.__repo.update(options, input);
  }

  remove(options: FindOptionsWhere<Entity>) {
    return this.__repo.delete(options);
  }

  async getOrCreate(
    options: FindOneOptions<Entity>,
    input: DeepPartial<Entity>,
  ) {
    const oldEntity = await this.findOne(options);
    if (oldEntity) {
      return oldEntity;
    }
    const data = this.__repo.create(input);
    const entity = await this.__repo.save(data);
    return entity;
  }
}
