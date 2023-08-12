import { InputType, Field, ID, PartialType } from '@nestjs/graphql';

@InputType()
export class CreateExtrasInput {}

@InputType()
export class UpdateExtrasInput extends PartialType(CreateExtrasInput) {}

@InputType()
export class FindAllExtrasInput {}
