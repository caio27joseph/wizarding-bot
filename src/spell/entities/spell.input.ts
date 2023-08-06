import { InputType, Int, Field, PartialType, ID } from '@nestjs/graphql';
import { ActionTypeEnum, SpellCategoryEnum } from './spell.entity';

@InputType()
export class CreateSpellInput {
  id: string;
  name: string;
  level: number;
  action: ActionTypeEnum;
  description: string;
  category: SpellCategoryEnum;
}

@InputType()
export class UpdateSpellInput extends PartialType(CreateSpellInput) {}

@InputType()
export class FindAllSpellInput {
  @Field(() => ID)
  guildId: string;
}
