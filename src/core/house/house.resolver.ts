import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { HouseService } from './house.service';
import { House } from './entities/house.entity';
import {
  CreateHouseInput,
  FindAllHouseInput,
  UpdateHouseInput,
} from './entities/house.input';
import { DeleteResult, UpdateResult } from '~/graphql.result';

@Resolver(() => House)
export class HouseResolver {
  constructor(private readonly houseService: HouseService) {}

  @Mutation(() => House)
  createHouse(@Args('input') input: CreateHouseInput) {
    return this.houseService.create(input);
  }

  @Query(() => [House], { name: 'houses' })
  findAll(@Args('where') where: FindAllHouseInput) {
    return this.houseService.findAll({ where });
  }

  @Query(() => House, { name: 'house' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.houseService.findOne({ where: { id } });
  }

  @Mutation(() => UpdateResult)
  updateHouse(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateHouseInput,
  ) {
    return this.houseService.update({ id }, input);
  }

  @Mutation(() => DeleteResult)
  removeHouse(@Args('id', { type: () => ID }) id: string) {
    return this.houseService.remove({ id });
  }
}
