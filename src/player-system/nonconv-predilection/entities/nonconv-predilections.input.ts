import { InputType, Field, ID, PartialType } from '@nestjs/graphql';

@InputType()
export class CreateNonConvPredilectionsInput {}

@InputType()
export class UpdateNonConvPredilectionsInput extends PartialType(
  CreateNonConvPredilectionsInput,
) {}

@InputType()
export class FindAllNonConvPredilectionsInput {}
