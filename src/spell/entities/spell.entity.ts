import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export enum SpellDifficultyEnum {
  ABJURATION = 'Abjuração',
  DIVINATION = 'Adivinhação',
  CONJURATION = 'Convocação',
  ENCHANTMENT = 'Encantamento',
  EVOCATION = 'Evocação',
  ILLUSION = 'Ilusão',
  NECROMANCY = 'Necromancia',
  TRANSMUTATION = 'Transmutação',
  UNIVERSAL = 'Universal',
}
registerEnumType(SpellDifficultyEnum, {
  name: 'SpellDifficultyEnum',
});
export enum SpellCategoryEnum {
  ABJURATION = 'Abjuração',
  DIVINATION = 'Adivinhação',
  CONJURATION = 'Convocação',
  ENCHANTMENT = 'Encantamento',
  EVOCATION = 'Evocação',
  ILLUSION = 'Ilusão',
  NECROMANCY = 'Necromancia',
  TRANSMUTATION = 'Transmutação',
  UNIVERSAL = 'Universal',
}
registerEnumType(SpellCategoryEnum, {
  name: 'SpellCategoryEnum',
});

// TODO: move this to combat module when ready
export enum ActionTypeEnum {
  STANDARD = 'Padrão',
  STANDARD_OR_REACTION = 'Padrão ou Reação',
  MOVEMENT = 'Movimento',
  FULL = 'Completa',
  FREE = 'Livre',
  REACTION = 'Reação',
}
registerEnumType(ActionTypeEnum, {
  name: 'ActionTypeEnum',
});

export enum MaestryNameEnum {
  INITIAL = 'Inicial',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado',
  EXPERT = 'Especialista',
  MASTER = 'Mestre',
}
registerEnumType(MaestryNameEnum, {
  name: 'MaestryNameEnum',
});

@Entity()
@ObjectType()
export class Spell {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  level: number;

  @Column({
    type: 'enum',
    enum: ActionTypeEnum,
  })
  @Field((type) => ActionTypeEnum)
  action: ActionTypeEnum;

  @Column('text')
  description: string;

  // Create the enum
  @Column({
    type: 'enum',
    enum: SpellCategoryEnum,
  })
  @Field((type) => SpellCategoryEnum)
  category: SpellCategoryEnum;
}

@Entity()
export class Maestry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  level: number;

  @Column({
    type: 'enum',
    enum: MaestryNameEnum,
  })
  @Field((type) => MaestryNameEnum)
  name: MaestryNameEnum;

  @Column('text')
  @Field(() => String)
  description: string;
}
