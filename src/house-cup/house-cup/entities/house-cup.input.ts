import { InputType, Int, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class CreateHouseCupInput {
  @Field()
  name?: string;
}

@InputType()
export class UpdateHouseCupInput extends PartialType(CreateHouseCupInput) {
  @Field(() => ID)
  id: string;
}

@InputType()
export class FindAllHouseCupInput {
  @Field(() => ID, { nullable: true })
  houseId?: string;
  @Field(() => ID, { nullable: true })
  playerId?: string;
}
