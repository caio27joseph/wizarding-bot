import { InputType, Field, ID, PartialType } from '@nestjs/graphql';

@InputType()
export class CreateAttributesInput {}

@InputType()
export class UpdateAttributesInput extends PartialType(CreateAttributesInput) {}

@InputType()
export class FindAllAttributesInput {}
