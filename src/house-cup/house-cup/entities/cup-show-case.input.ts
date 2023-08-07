import { InputType, Int, Field, PartialType, ID } from '@nestjs/graphql';
import { HousePodium } from './cup-show-case.entity';

@InputType()
export class CreateCupShowCaseInput {
  @Field((type) => [HousePodium])
  podiums: HousePodium[];

  @Field()
  channelId: string;

  @Field()
  lastMessageId: string;

  @Field()
  cupId: string;

  @Field({
    nullable: true,
  })
  message?: string;
}

@InputType()
export class UpdateCupShowCaseInput extends PartialType(
  CreateCupShowCaseInput,
) {}

@InputType()
export class FindAllCupShowCaseInput {
  @Field(() => ID, { nullable: true })
  houseId?: string;
  @Field(() => ID, { nullable: true })
  playerId?: string;
}
