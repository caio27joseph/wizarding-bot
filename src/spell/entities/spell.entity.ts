import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

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

// TODO: move this to combat module when ready
export enum ActionTypeEnum {
  STANDARD = 'Padrão',
  MOVEMENT = 'de Movimento',
  FULL = 'Completa',
  FREE = 'Livre',
  REACTION = 'Reação',
}

@Entity()
export class Spell {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;

  @Column()
  level: number;

  @Column({
    type: 'enum',
    enum: ActionTypeEnum,
  })
  action: ActionTypeEnum;

  @Column('text')
  description: string;

  // Create the enum
  @Column({
    type: 'enum',
    enum: SpellCategoryEnum,
  })
  category: SpellCategoryEnum;
}

export enum MaestryNameEnum {
  INITIAL = 'Inicial',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado',
  EXPERT = 'Experiente',
  MASTER = 'Mestre',
}

@Entity()
export class Maestry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MaestryNameEnum,
  })
  name: MaestryNameEnum;

  @Column('text')
  description: string;
}
