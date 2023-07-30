import { InputType, Int, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class CreateHouseInput {}

@InputType()
export class UpdateHouseInput extends PartialType(CreateHouseInput) {}

@InputType()
export class FindAllHouseInput {}
