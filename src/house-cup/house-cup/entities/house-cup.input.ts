import { InputType, Int, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class CreateHouseCupInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}

@InputType()
export class UpdateHouseCupInput extends PartialType(CreateHouseCupInput) {
  @Field(() => Int)
  id: number;
}

@InputType()
export class FindAllHouseCupInput {
  @Field(() => ID, { nullable: true })
  houseId?: string;
  @Field(() => ID, { nullable: true })
  playerId?: string;
}
