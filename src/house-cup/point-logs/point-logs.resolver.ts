import { Resolver, Query, Args, Parent, ResolveField } from '@nestjs/graphql';
import { PointLogsService } from './point-logs.service';
import { PointLog } from './entities/point-log.entity';
import { FindAllPointLogInput } from './entities/point-log.input';
import { HouseCup } from '../house-cup/entities/house-cup.entity';
import { HouseCupService } from '../house-cup/house-cup.service';
import { Player } from '~/core/player/entities/player.entity';
import { PlayerService } from '~/core/player/player.service';
import { HouseService } from '~/core/house/house.service';
import { Inject, forwardRef } from '@nestjs/common';

@Resolver(() => PointLog)
export class PointLogsResolver {
  constructor(
    private readonly pointLogsService: PointLogsService,
    private readonly cupService: HouseCupService,
    private readonly houseService: HouseService,
    private readonly playerService: PlayerService,
  ) {}

  //resolvefield Cup
  @ResolveField(() => HouseCup)
  async cup(@Parent() pointLog: PointLog) {
    return this.cupService.findOne({
      where: {
        id: pointLog.cupId,
      },
    });
  }
  @ResolveField(() => HouseCup)
  async house(@Parent() pointLog: PointLog) {
    return this.houseService.findOne({
      where: {
        id: pointLog.houseId,
      },
    });
  }
  // @ResolveField(() => Player)
  // async player(@Parent() pointLog: PointLog) {
  //   return this.cupService.findOne({
  //     where: {
  //       id: pointLog.cupId,
  //     },
  //   });
  // }

  // @Mutation(() => PointLog)
  // createPointLog(
  //   @Args('createPointLogInput') createPointLogInput: CreatePointLogInput,
  // ) {
  //   return this.pointLogsService.create(createPointLogInput);
  // }

  @Query(() => [PointLog], { name: 'pointLogs' })
  findAll(@Args('where') where: FindAllPointLogInput) {
    return this.pointLogsService.findAll({
      where,
      relations: {
        player: true,
      },
    });
  }

  @Query(() => PointLog, { name: 'pointLog' })
  findOne(@Args('houseId') houseId: string) {
    return this.pointLogsService.findOne({
      where: {
        houseId,
      },
    });
  }

  // @Mutation(() => PointLog)
  // updatePointLog(
  //   @Args('updatePointLogInput') updatePointLogInput: UpdatePointLogInput,
  // ) {
  //   return this.pointLogsService.update(
  //     updatePointLogInput.id,
  //     updatePointLogInput,
  //   );
  // }

  // @Mutation(() => PointLog)
  // removePointLog(@Args('id', { type: () => Int }) id: number) {
  //   return this.pointLogsService.remove(id);
  // }
}
