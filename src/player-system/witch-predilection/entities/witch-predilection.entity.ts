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
import { getDisplayKeyMaps } from '~/utils/entity-types';

export enum WitchPredilectionDisplayEnum {
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

export enum WitchPredilectionKeyEnum {
  ABJURATION = 'abjuration',
  ENCHANTMENT = 'enchantment',
  NECROMANCY = 'necromancy',

  DIVINATION = 'divination',
  EVOCATION = 'evocation',
  TRANSMUTATION = 'transmutation',

  CONJURATION = 'conjuration',
  ILLUSION = 'illusion',
  UNIVERSAL = 'universal',
}

export const {
  displayToKeyMap: witchPredilectionDisplayToKeyMap,
  keyToDisplayMap: witchPredilectionKeyToDisplayMap,
} = getDisplayKeyMaps(WitchPredilectionDisplayEnum, WitchPredilectionKeyEnum);

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

export const witchPredilectionChoices = Object.keys(
  WitchPredilectionDisplayEnum,
).map((competence) =>
  enumToChoice(competence as any, WitchPredilectionDisplayEnum),
);

@Entity()
@ObjectType()
export class MagicSchool implements DiscordEntityVieable {
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
        value: `${WitchPredilectionDisplayEnum.ABJURATION}: ${this.abjuration}\n${WitchPredilectionDisplayEnum.ENCHANTMENT}: ${this.enchantment}\n${WitchPredilectionDisplayEnum.NECROMANCY}: ${this.necromancy}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${WitchPredilectionDisplayEnum.DIVINATION}: ${this.divination}\n${WitchPredilectionDisplayEnum.EVOCATION}: ${this.evocation}\n${WitchPredilectionDisplayEnum.TRANSMUTATION}: ${this.transmutation}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${WitchPredilectionDisplayEnum.CONJURATION}: ${this.conjuration}\n${WitchPredilectionDisplayEnum.ILLUSION}: ${this.illusion}\n${WitchPredilectionDisplayEnum.UNIVERSAL}: ${this.universal}`,
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
