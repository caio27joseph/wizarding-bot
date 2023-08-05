import {
  InputType,
  Int,
  Field,
  PartialType,
  ID,
  OmitType,
} from '@nestjs/graphql';

@InputType()
export class CreateGuildInput {
  @Field({ nullable: true })
  prefix?: string;

  @Field(() => ID)
  modRoleId: string;
  @Field(() => ID)
  id: string;
}

@InputType()
export class UpdateGuildInput extends PartialType(
  OmitType(CreateGuildInput, ['id']),
) {}

@InputType()
export class FindAllGuildInput {}
