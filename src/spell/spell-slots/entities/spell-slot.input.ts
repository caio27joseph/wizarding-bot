import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class CreateSpellSlotInput {}

@InputType()
export class UpdateSpellSlotInput extends PartialType(CreateSpellSlotInput) {}

@InputType()
export class FindAllSpellSlotInput {}
