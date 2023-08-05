import { InputType, Int, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class CreatePointLogInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}

@InputType()
export class UpdatePointLogInput extends PartialType(CreatePointLogInput) {
  @Field(() => Int)
  id: number;
}

@InputType()
export class FindAllPointLogInput {
  @Field(() => ID, { nullable: true })
  guildId?: string;
  @Field(() => ID, { nullable: true })
  houseId?: string;
  @Field(() => ID, { nullable: true })
  cupId?: string;
  @Field(() => ID, { nullable: true })
  playerId?: string;
}
