import { InputType, Field, ID, PartialType } from '@nestjs/graphql';

@InputType()
export class CreateWitchPredilectionsInput {}

@InputType()
export class UpdateWitchPredilectionsInput extends PartialType(
  CreateWitchPredilectionsInput,
) {}

@InputType()
export class FindAllWitchPredilectionsInput {}
