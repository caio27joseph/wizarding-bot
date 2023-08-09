import { InputType, Field, ID, PartialType } from '@nestjs/graphql';

@InputType()
export class CreateCompetencesInput {}

@InputType()
export class UpdateCompetencesInput extends PartialType(
  CreateCompetencesInput,
) {}

@InputType()
export class FindAllCompetencesInput {}
