import { InputType, Int, Field, PartialType, ID } from '@nestjs/graphql';
import {
  ActionTypeEnum,
  Maestry,
  SpellCategoryEnum,
  SpellDifficultyEnum,
} from './spell.entity';

@InputType()
export class CreateSpellInput {
  @Field(() => ID)
  identifier: string;
  @Field()
  name: string;
  @Field()
  title: string;
  @Field()
  level: number;
  @Field({
    nullable: true,
  })
  light?: string;
  @Field({
    nullable: true,
  })
  meta?: string;
  @Field({
    nullable: true,
  })
  antiSpell?: string;
  @Field({
    nullable: true,
  })
  requirements?: string;
  @Field({
    nullable: true,
  })
  duration?: string;

  @Field({ nullable: true })
  distance?: string;
  @Field()
  difficulty: SpellDifficultyEnum;

  @Field((type) => ActionTypeEnum)
  actionType: ActionTypeEnum;

  @Field()
  description: string;

  @Field((type) => [SpellCategoryEnum])
  category: SpellCategoryEnum[];
  updatedAt: Date;

  @Field(() => [Maestry])
  maestry: Maestry[];

  @Field(() => ID)
  guildId: string;
}

@InputType()
export class UpdateSpellInput extends PartialType(CreateSpellInput) {}

@InputType()
export class FindAllSpellInput {
  @Field(() => ID)
  guildId: string;
}
