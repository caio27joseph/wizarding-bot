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
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { DiscordEntityVieable } from '~/discord/types';
import { Train } from '~/train/entities/train.entity';

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

  // Create the enum
  @Field((type) => [SpellCategoryEnum])
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

  toShortEmbed() {
    const embed = new EmbedBuilder();
    embed.setTitle(this.name);
    let description = '';
    description += `${this.category} / ${this.difficulty}\n`;
    embed.setDescription(description);
    embed.setAuthor({
      name: this.title,
    });
    return embed;
  }
  toShortText(n?: number) {
    let message = `### ${n ? n + '.' : ''}${this.name} - ${this.title}\n`;
    message += `Nivel ${this.level}, ${this.category} / ${this.difficulty}`;
    return message;
  }

  toEmbed() {
    const embed = new EmbedBuilder();
    embed.setTitle(this.name);
    embed.setDescription(this.description);
    embed.setFooter({
      text: `${this.category.join(', ')} / ${this.difficulty}`,
    });
    embed.setAuthor({
      name: this.title,
    });
    const fields: APIEmbedField[] = [];
    if (this.light) {
      fields.push({
        name: 'Lampejo',
        value: this.light,
        inline: true,
      });
    }
    if (this.meta) {
      fields.push({
        name: 'Meta',
        value: this.meta,
        inline: true,
      });
    }
    if (this.antiSpell) {
      fields.push({
        name: 'Contra-Feitiço',
        value: this.antiSpell,
        inline: true,
      });
    }
    if (this.requirements) {
      fields.push({
        name: 'Requisitos',
        value: this.requirements,
        inline: true,
      });
    }
    if (this.duration) {
      fields.push({
        name: 'Duração',
        value: this.duration,
        inline: true,
      });
    }
    if (this.distance) {
      fields.push({
        name: 'Distância',
        value: this.distance,
        inline: true,
      });
    }

    for (const maestry of this.maestry) {
      const level = '⚪'.repeat(maestry.level) + '⚫'.repeat(5 - maestry.level);
      fields.push({
        name: `${level} - ${maestry.name}`,
        value: maestry.description,
      });
    }
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
