import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { PlayerService } from './player.service';
import { Player } from './entities/player.entity';
import {
  CreatePlayerInput,
  FindAllPlayerInput,
  UpdatePlayerInput,
} from './entities/player.input';

@Resolver(() => Player)
export class PlayerResolver {
  constructor(private readonly playerService: PlayerService) {}

  @Mutation(() => Player)
  createPlayer(@Args('input') input: CreatePlayerInput) {
    return this.playerService.create(input);
  }

  @Query(() => [Player], { name: 'players' })
  findAll(@Args('where') where: FindAllPlayerInput) {
    return this.playerService.findAll({
      where,
    });
  }

  @Query(() => Player, { name: 'player' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.playerService.findOne({
      where: {
        id,
      },
    });
  }

  @Mutation(() => Player)
  updatePlayer(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePlayerInput,
  ) {
    return this.playerService.update(id, input);
  }

  @Mutation(() => Player)
  removePlayer(@Args('id', { type: () => ID }) id: string) {
    return this.playerService.remove(id);
  }
}
