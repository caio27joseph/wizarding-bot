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

  // @Mutation(() => Player)
  // createPlayer(
  //   @Args('createPlayerInput') createPlayerInput: CreatePlayerInput,
  // ) {
  //   return this.playerService.create(createPlayerInput);
  // }

  @Query(() => [Player], { name: 'players' })
  findAll(@Args('input') input: FindAllPlayerInput) {
    return this.playerService.findAll({
      where: input,
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

  // @Mutation(() => Player)
  // updatePlayer(
  //   @Args('updatePlayerInput') updatePlayerInput: UpdatePlayerInput,
  // ) {
  //   return this.playerService.update(updatePlayerInput.id, updatePlayerInput);
  // }

  // @Mutation(() => Player)
  // removePlayer(@Args('id', { type: () => Int }) id: number) {
  //   return this.playerService.remove(id);
  // }
}
