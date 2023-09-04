import { InputType, Field, ID, PartialType } from '@nestjs/graphql';

@InputType()
export class CreateMagicSchoolInput {}

@InputType()
export class UpdateMagicSchoolInput extends PartialType(
  CreateMagicSchoolInput,
) {}

@InputType()
export class FindAllMagicSchoolInput {}
