import { Field, ObjectType } from '@nestjs/graphql';
import { EmbedBuilder, Interaction, MessagePayload } from 'discord.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { enumToChoice } from '~/discord/discord.utils';
import { DiscordEntityVieable } from '~/discord/types';

export enum WitchPredilectionNameEnum {
  ABJURATION = 'Abjuração',
  ENCHANTMENT = 'Encantamento',
  NECROMANCY = 'Necromancia',

  DIVINATION = 'Adivinhação',
  EVOCATION = 'Evocação',
  TRANSMUTATION = 'Transmutação',

  CONJURATION = 'Conjuração',
  ILLUSION = 'Ilusão',
  UNIVERSAL = 'Universal',
}

export type WitchPredilectionNameValue =
  | 'Abjuração'
  | 'Encantamento'
  | 'Necromancia'
  | 'Adivinhação'
  | 'Evocação'
  | 'Transmutação'
  | 'Conjuração'
  | 'Ilusão'
  | 'Universal';

// map reverse
export const witchPredilectionNameMap = {
  [WitchPredilectionNameEnum.ABJURATION]: 'abjuration',
  [WitchPredilectionNameEnum.ENCHANTMENT]: 'enchantment',
  [WitchPredilectionNameEnum.NECROMANCY]: 'necromancy',
  [WitchPredilectionNameEnum.DIVINATION]: 'divination',
  [WitchPredilectionNameEnum.EVOCATION]: 'evocation',
  [WitchPredilectionNameEnum.TRANSMUTATION]: 'transmutation',
  [WitchPredilectionNameEnum.CONJURATION]: 'conjuration',
  [WitchPredilectionNameEnum.ILLUSION]: 'illusion',
  [WitchPredilectionNameEnum.UNIVERSAL]: 'universal',
};

export const witchPredilectionChoices = Object.keys(
  WitchPredilectionNameEnum,
).map((competence) =>
  enumToChoice(competence as any, WitchPredilectionNameEnum),
);

@Entity()
@ObjectType()
export class WitchPredilection implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    default: 0,
  })
  @Field()
  abjuration: number;
  @Column({
    default: 0,
  })
  @Field()
  enchantment: number;
  @Column({
    default: 0,
  })
  @Field()
  necromancy: number;
  @Column({
    default: 0,
  })
  @Field()
  divination: number;
  @Column({
    default: 0,
  })
  @Field()
  evocation: number;
  @Column({
    default: 0,
  })
  @Field()
  transmutation: number;
  @Column({
    default: 0,
  })
  @Field()
  conjuration: number;
  @Column({
    default: 0,
  })
  @Field()
  illusion: number;
  @Column({
    default: 0,
  })
  @Field()
  universal: number;

  @OneToOne(() => Player, (player) => player.witchPredilections, {
    cascade: true,
  })
  @JoinColumn()
  player: Player;

  @Column()
  playerId: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  toEmbed() {
    const embed = new EmbedBuilder().setTitle('Predileções Bruxas');
    embed.addFields(
      {
        name: `-----`,
        value: `${WitchPredilectionNameEnum.ABJURATION}: ${this.abjuration}\n${WitchPredilectionNameEnum.ENCHANTMENT}: ${this.enchantment}\n${WitchPredilectionNameEnum.NECROMANCY}: ${this.necromancy}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${WitchPredilectionNameEnum.DIVINATION}: ${this.divination}\n${WitchPredilectionNameEnum.EVOCATION}: ${this.evocation}\n${WitchPredilectionNameEnum.TRANSMUTATION}: ${this.transmutation}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${WitchPredilectionNameEnum.CONJURATION}: ${this.conjuration}\n${WitchPredilectionNameEnum.ILLUSION}: ${this.illusion}\n${WitchPredilectionNameEnum.UNIVERSAL}: ${this.universal}`,
        inline: true,
      },
    );

    return embed;
  }
  reply(interaction: Interaction) {
    return new MessagePayload(interaction, {
      embeds: [this.toEmbed()],
    });
  }
}
