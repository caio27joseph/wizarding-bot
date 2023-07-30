import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { HouseCupService } from './house-cup.service';
import { HouseCup } from './entities/house-cup.entity';
import {
  CreateHouseCupInput,
  UpdateHouseCupInput,
} from './entities/house-cup.input';

@Resolver(() => HouseCup)
export class HouseCupResolver {
  constructor(private readonly houseCupService: HouseCupService) {}

  @Mutation(() => HouseCup)
  createHouseCup(
    @Args('createHouseCupInput') createHouseCupInput: CreateHouseCupInput,
  ) {
    return this.houseCupService.create(createHouseCupInput);
  }

  @Query(() => [HouseCup], { name: 'houseCup' })
  findAll() {
    return this.houseCupService.findAll();
  }

  // @Query(() => HouseCup, { name: 'houseCup' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.houseCupService.findOne({

  //   });
  // }

  @Mutation(() => HouseCup)
  updateHouseCup(
    @Args('updateHouseCupInput') updateHouseCupInput: UpdateHouseCupInput,
  ) {
    return this.houseCupService.update(
      updateHouseCupInput.id,
      updateHouseCupInput,
    );
  }

  @Mutation(() => HouseCup)
  removeHouseCup(@Args('id', { type: () => Int }) id: number) {
    return this.houseCupService.remove(id);
  }
}
