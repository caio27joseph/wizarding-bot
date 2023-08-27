import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { WandWood } from './entities/wand-wood.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class WandWoodService extends BasicService<
  WandWood,
  DeepPartial<WandWood>,
  QueryDeepPartialEntity<WandWood>
> {
  entityName = 'WandWood';
  constructor(
    @InjectRepository(WandWood) private readonly repo: Repository<WandWood>,
  ) {
    super(repo);
  }

  async updateOrCreate(input: DeepPartial<WandWood>) {
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
