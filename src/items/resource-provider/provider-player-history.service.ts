import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ProviderPlayerHistory } from './entities/provider-player-history.entity';
import { ResourceProvider } from './entities/resource-provider.entity';
import { Player } from '~/core/player/entities/player.entity';

@Injectable()
export class ProviderPlayerHistoryService extends BasicService<
  ProviderPlayerHistory,
  DeepPartial<ProviderPlayerHistory>,
  QueryDeepPartialEntity<ProviderPlayerHistory>
> {
  entityName = 'ProviderPlayerHistory';
  constructor(
    @InjectRepository(ProviderPlayerHistory)
    private readonly repo: Repository<ProviderPlayerHistory>,
  ) {
    super(repo);
  }

  async getHistory(provider: ResourceProvider, player: Player) {
    let history: ProviderPlayerHistory = await this.getOrCreate({
      where: {
        provider: {
          id: provider.id
        },
        playerId: player.id
      }
    },
      {
        player,
        provider,
        lastTimeOpened: new Date(),
        lastTimeSearched: new Date(),
      });
    return history;
  }
}
