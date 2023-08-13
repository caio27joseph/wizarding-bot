import { Injectable } from '@nestjs/common';
import {
  CreatePointLogInput,
  UpdatePointLogInput,
} from './entities/point-log.input';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { PointLog } from './entities/point-log.entity';
import { HouseCup } from '../house-cup/entities/house-cup.entity';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';

@Injectable()
export class PointLogsService {
  constructor(
    @InjectRepository(PointLog)
    private repo: Repository<PointLog>,
  ) {}

  create(createPointLogInput: CreatePointLogInput) {
    return 'This action adds a new pointLog';
  }

  findAll(options?: FindManyOptions<PointLog>) {
    return this.repo.find(options);
  }

  findOne(options: FindOneOptions<PointLog>) {
    return this.repo.findOne(options);
  }

  update(id: number, updatePointLogInput: UpdatePointLogInput) {
    return `This action updates a #${id} pointLog`;
  }

  remove(options: FindOptionsWhere<PointLog>) {
    return this.repo.delete(options);
  }
  addPoints(
    cup: HouseCup,
    player: Player,
    value: number,
    channelId: string,
    reason?: string,
  ) {
    if (!cup?.active)
      throw new DiscordSimpleError('Voce precisa iniciar a taca das casas');
    const data = this.repo.create({
      cup,
      player,
      house: player.house,
      value: value,
      reason,
      channelId,
    });
    return this.repo.save(data);
  }
}
