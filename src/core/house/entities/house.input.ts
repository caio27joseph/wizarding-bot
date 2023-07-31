import { InputType, Int, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class CreateHouseInput {
  @Field({ nullable: true })
  title?: string;
  @Field({ nullable: true })
  imageUrl?: string;
  @Field({ nullable: true })
  color?: number;

  @Field(() => ID)
  discordRoleId: string;
  @Field(() => ID)
  guildId: string;
}

@InputType()
export class UpdateHouseInput extends PartialType(CreateHouseInput) {}

@InputType()
export class FindAllHouseInput {
  @Field(() => ID)
  guildId: string;
}
