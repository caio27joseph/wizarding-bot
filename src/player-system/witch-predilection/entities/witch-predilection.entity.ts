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

export enum MagicSchoolDisplayEnum {
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

export enum MagicSchoolKeyEnum {
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

export type MagicSchoolDisplays =
  | 'Abjuração'
  | 'Encantamento'
  | 'Necromancia'
  | 'Adivinhação'
  | 'Evocação'
  | 'Transmutação'
  | 'Conjuração'
  | 'Ilusão'
  | 'Universal';

export type MagicSchoolKeys =
  | 'abjuration'
  | 'enchantment'
  | 'necromancy'
  | 'divination'
  | 'evocation'
  | 'transmutation'
  | 'conjuration'
  | 'illusion'
  | 'universal';

export const {
  displayToKeyMap: magicSchoolDisplayToKeyMap,
  keyToDisplayMap: MagicSchoolPtBr,
} = getDisplayKeyMaps<MagicSchoolKeys, MagicSchoolDisplays>(
  MagicSchoolDisplayEnum,
  MagicSchoolKeyEnum,
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

  @OneToOne(() => Player, (player) => player.magicSchool, {
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
        value: `${MagicSchoolDisplayEnum.ABJURATION}: ${this.abjuration}\n${MagicSchoolDisplayEnum.ENCHANTMENT}: ${this.enchantment}\n${MagicSchoolDisplayEnum.NECROMANCY}: ${this.necromancy}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${MagicSchoolDisplayEnum.DIVINATION}: ${this.divination}\n${MagicSchoolDisplayEnum.EVOCATION}: ${this.evocation}\n${MagicSchoolDisplayEnum.TRANSMUTATION}: ${this.transmutation}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${MagicSchoolDisplayEnum.CONJURATION}: ${this.conjuration}\n${MagicSchoolDisplayEnum.ILLUSION}: ${this.illusion}\n${MagicSchoolDisplayEnum.UNIVERSAL}: ${this.universal}`,
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
