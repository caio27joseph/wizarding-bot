import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class CreateAbilitiesInput {}

@InputType()
export class UpdateAbilitiesInput extends PartialType(CreateAbilitiesInput) {}

@InputType()
export class FindAllAbilitiesInput {}
