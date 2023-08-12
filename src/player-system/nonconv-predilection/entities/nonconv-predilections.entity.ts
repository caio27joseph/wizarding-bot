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

export enum NonConvPredilectionsNameEnum {
  BROOMMANCY = 'Vassouromancia',
  M_SELVAGEM = 'M Selvagem',
  M_ANCESTRAL = 'M Ancestral',

  ELEMENTAL = 'Elemental',
  ESPIRITUAL = 'Espiritual',
  M_MENTAL = 'M Mental',

  M_AMORMENTE = 'M Amormente',
  M_TEMPORAL = 'M Temporal',
  WANDMANCY = 'Varinhomancia',
}

export const nonConvPredilectionsChoices = Object.keys(
  NonConvPredilectionsNameEnum,
).map((competence) =>
  enumToChoice(competence as any, NonConvPredilectionsNameEnum),
);

@Entity()
@ObjectType()
export class NonConvPredilections implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    default: 0,
  })
  @Field()
  broommancy: number;
  @Column({
    default: 0,
  })
  @Field()
  m_selvagem: number;
  @Column({
    default: 0,
  })
  @Field()
  m_ancestral: number;
  @Column({
    default: 0,
  })
  @Field()
  elemental: number;
  @Column({
    default: 0,
  })
  @Field()
  espiritual: number;
  @Column({
    default: 0,
  })
  @Field()
  m_mental: number;
  @Column({
    default: 0,
  })
  @Field()
  m_amormente: number;
  @Column({
    default: 0,
  })
  @Field()
  m_temporal: number;
  @Column({
    default: 0,
  })
  @Field()
  wandmancy: number;

  @OneToOne(() => Player, (player) => player.nonConvPredilections, {
    cascade: true,
  })
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
        value: `${NonConvPredilectionsNameEnum.BROOMMANCY}: ${this.broommancy}\n${NonConvPredilectionsNameEnum.M_SELVAGEM}: ${this.m_selvagem}\n${NonConvPredilectionsNameEnum.M_ANCESTRAL}: ${this.m_ancestral}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${NonConvPredilectionsNameEnum.ELEMENTAL}: ${this.elemental}\n${NonConvPredilectionsNameEnum.ESPIRITUAL}: ${this.espiritual}\n${NonConvPredilectionsNameEnum.M_MENTAL}: ${this.m_mental}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${NonConvPredilectionsNameEnum.M_AMORMENTE}: ${this.m_amormente}\n${NonConvPredilectionsNameEnum.M_TEMPORAL}: ${this.m_temporal}\n${NonConvPredilectionsNameEnum.WANDMANCY}: ${this.wandmancy}`,
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
