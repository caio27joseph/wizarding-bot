import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { LootBox } from './loot-box.entity';
import { DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class LootBoxService extends BasicService<
  LootBox,
  DeepPartial<LootBox>,
  QueryDeepPartialEntity<LootBox>
> {}
