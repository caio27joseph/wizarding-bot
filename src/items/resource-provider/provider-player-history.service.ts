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
    let history: ProviderPlayerHistory;
    history = provider.playerHistories.find((h) => h.player.id === player.id);
    if (!history) {
      history = await this.create({
        player,
        provider,
        lastTimeOpened: new Date(),
        lastTimeSearched: new Date(),
      });
    }
    return history;
  }
}
