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

export enum NonConvPredilectionsDisplayEnum {
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
export enum NonConvPredilectionsKeyEnum {
  BROOMMANCY = 'broommancy',
  M_SELVAGEM = 'm_selvagem',
  M_ANCESTRAL = 'm_ancestral',

  ELEMENTAL = 'elemental',
  ESPIRITUAL = 'espiritual',
  M_MENTAL = 'm_mental',

  M_AMORMENTE = 'm_amormente',
  M_TEMPORAL = 'm_temporal',
  WANDMANCY = 'wandmancy',
}

export const {
  displayToKeyMap: nonConvDisplayToKeyMap,
  keyToDisplayMap: nonConvKeyToDisplayMap,
} = getDisplayKeyMaps(
  NonConvPredilectionsDisplayEnum,
  NonConvPredilectionsKeyEnum,
);

export const nonConvPredilectionsChoices = Object.keys(
  NonConvPredilectionsDisplayEnum,
).map((competence) =>
  enumToChoice(competence as any, NonConvPredilectionsDisplayEnum),
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
  @JoinColumn()
  player: Player;

  @Column()
  playerId: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  toEmbed() {
    const embed = new EmbedBuilder().setTitle('Predileções Não Convencionais');
    embed.addFields(
      {
        name: `-----`,
        value: `${NonConvPredilectionsDisplayEnum.BROOMMANCY}: ${this.broommancy}\n${NonConvPredilectionsDisplayEnum.M_SELVAGEM}: ${this.m_selvagem}\n${NonConvPredilectionsDisplayEnum.M_ANCESTRAL}: ${this.m_ancestral}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${NonConvPredilectionsDisplayEnum.ELEMENTAL}: ${this.elemental}\n${NonConvPredilectionsDisplayEnum.ESPIRITUAL}: ${this.espiritual}\n${NonConvPredilectionsDisplayEnum.M_MENTAL}: ${this.m_mental}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${NonConvPredilectionsDisplayEnum.M_AMORMENTE}: ${this.m_amormente}\n${NonConvPredilectionsDisplayEnum.M_TEMPORAL}: ${this.m_temporal}\n${NonConvPredilectionsDisplayEnum.WANDMANCY}: ${this.wandmancy}`,
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
