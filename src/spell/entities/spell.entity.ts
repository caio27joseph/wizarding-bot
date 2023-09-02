import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  APIEmbedField,
  EmbedBuilder,
  Interaction,
  MessagePayload,
} from 'discord.js';
import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { DiscordEntityVieable } from '~/discord/types';
import { Grimoire } from '~/grimoire/entities/grimoire.entity';
import { Train } from '~/train/entities/train.entity';

export enum SpellCategoryNameEnum {
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

registerEnumType(SpellCategoryNameEnum, {
  name: 'SpellCategoryEnum',
});

export type SpellCategoryNameValue =
  | 'Abjuração'
  | 'Adivinhação'
  | 'Convocação'
  | 'Encantamento'
  | 'Evocação'
  | 'Ilusão'
  | 'Necromancia'
  | 'Transmutação'
  | 'Universal';

export enum SpellDifficultyEnum {
  EASY = 'Fácil',
  MEDIUM = 'Médio',
  HARD = 'Difícil',
  VERY_HARD = 'Muito Difícil',
}
registerEnumType(SpellDifficultyEnum, {
  name: 'SpellDifficultyEnum',
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
export const maestryNumToName = {
  1: MaestryNameEnum.INITIAL,
  2: MaestryNameEnum.INTERMEDIATE,
  3: MaestryNameEnum.ADVANCED,
  4: MaestryNameEnum.EXPERT,
  5: MaestryNameEnum.MASTER,
};

registerEnumType(MaestryNameEnum, {
  name: 'MaestryNameEnum',
});

@Entity()
@ObjectType()
export class Spell implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Index()
  @Column()
  @Field(() => ID)
  identifier: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  level: number;

  @Column({
    nullable: true,
  })
  @Field({
    nullable: true,
  })
  light?: string;

  @Column({
    nullable: true,
  })
  @Field({
    nullable: true,
  })
  meta?: string;

  @Column({
    nullable: true,
  })
  @Field({
    nullable: true,
  })
  resistence: string;

  @Column({
    nullable: true,
  })
  @Field({
    nullable: true,
  })
  antiSpell?: string;

  @Column({
    nullable: true,
  })
  @Field({
    nullable: true,
  })
  requirements?: string;

  @Column({
    nullable: true,
  })
  @Field({
    nullable: true,
  })
  duration?: string;

  @Column({
    nullable: true,
  })
  @Field({ nullable: true })
  distance?: string;

  @Column()
  @Field()
  difficulty: SpellDifficultyEnum;

  @Column({
    type: 'enum',
    enum: ActionTypeEnum,
  })
  @Field((type) => ActionTypeEnum)
  actionType: ActionTypeEnum;

  @Column('text')
  description: string;

  @Field((type) => [SpellCategoryNameEnum])
  @Column('text', {
    array: true,
    nullable: true,
  })
  category: string[];

  @Column()
  updatedAt: Date;

  @Column({
    type: 'json',
  })
  maestry: Maestry[];

  @ManyToOne(() => Guild, (guild) => guild.spells)
  guild: Guild;

  @Column()
  guildId: string;

  @OneToMany(() => Train, (train) => train.spell)
  trains: Train[];

  @ManyToMany(() => Grimoire)
  grimoires: Grimoire[];

  toShortEmbed() {
    const embed = new EmbedBuilder();
    embed.setTitle(this.name);
    let description = '';
    description += `${this.category} / ${this.difficulty}\n`;
    description += `Nivel ${this.level}\n`;
    embed.setDescription(description);
    embed.setAuthor({
      name: this.title,
    });
    return embed;
  }
  toShortText(n?: number) {
    let message = `### ${n ? n + '. ' : ''}${this.name} - ${this.title}\n`;
    message += `Nivel ${this.level}, ${this.category} / ${this.difficulty}`;
    return message;
  }

  toEmbed() {
    const embed = new EmbedBuilder();
    let description = '\n\n' + this.description;
    embed.setTitle(this.name);
    embed.setAuthor({
      name: this.title,
    });
    const fields: APIEmbedField[] = [];
    if (this.light) {
      description = `**Lampejo:** ${this.light}\n` + description;
    }
    if (this.meta) {
      description = `**Meta:** ${this.meta}\n` + description;
    }
    if (this.antiSpell) {
      description = `**Contra-Feiitço:** ${this.antiSpell}\n` + description;
    }
    if (this.requirements) {
      description = `**Requisitos:** ${this.requirements}\n` + description;
    }
    if (this.duration) {
      description = `**Duração:** ${this.duration}\n` + description;
    }
    if (this.distance) {
      description = `**Distância:** ${this.distance}\n` + description;
    }
    if (this.resistence) {
      description = `**Resistência:** ${this.resistence}\n` + description;
    }
    if (this.actionType) {
      description = `**Ação:** ${this.actionType}\n` + description;
    }
    description = `**Nivel:** ${this.level}\n` + description;
    description =
      `${this.category.join(', ')} / ${this.difficulty}\n` + description;

    for (const maestry of this.maestry) {
      const level = '⁌'.repeat(maestry.level) + '○'.repeat(5 - maestry.level);
      fields.push({
        name: `${level} - ${maestry.name}`,
        value: maestry.description.slice(0, 600),
      });
    }
    embed.setDescription(description);

    embed.setFields(fields);
    return embed;
  }
  reply(interaction: Interaction) {
    return new MessagePayload(interaction, {
      embeds: [this.toEmbed()],
    });
  }
}

@ObjectType()
export class Maestry {
  level: number;
  @Field((type) => MaestryNameEnum)
  name: MaestryNameEnum;
  @Field(() => String)
  description: string;
}
