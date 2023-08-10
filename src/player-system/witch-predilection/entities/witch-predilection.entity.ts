import { Field, ObjectType } from '@nestjs/graphql';
import { EmbedBuilder, Interaction, MessagePayload } from 'discord.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { enumToChoice } from '~/discord/discord.utils';
import { DiscordEntityVieable } from '~/discord/types';

export enum WitchPredilectionsNameEnum {
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

export const witchPredilectionsChoices = Object.keys(
  WitchPredilectionsNameEnum,
).map((competence) =>
  enumToChoice(competence as any, WitchPredilectionsNameEnum),
);

@Entity()
@ObjectType()
export class WitchPredilections implements DiscordEntityVieable {
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

  @OneToOne(() => Player, (player) => player.witchPredilections)
  player: Player;

  @Column()
  playerId: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  toEmbed() {
    const embed = new EmbedBuilder().setTitle('Competencias');
    embed.addFields(
      {
        name: `-----`,
        value: `${WitchPredilectionsNameEnum.ABJURATION}: ${this.abjuration}\n${WitchPredilectionsNameEnum.ENCHANTMENT}: ${this.enchantment}\n${WitchPredilectionsNameEnum.NECROMANCY}: ${this.necromancy}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${WitchPredilectionsNameEnum.DIVINATION}: ${this.divination}\n${WitchPredilectionsNameEnum.EVOCATION}: ${this.evocation}\n${WitchPredilectionsNameEnum.TRANSMUTATION}: ${this.transmutation}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${WitchPredilectionsNameEnum.CONJURATION}: ${this.conjuration}\n${WitchPredilectionsNameEnum.ILLUSION}: ${this.illusion}\n${WitchPredilectionsNameEnum.UNIVERSAL}: ${this.universal}`,
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
