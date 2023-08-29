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

export enum CompetenceDisplayEnum {
  APPARITION = 'Aparatação',
  MAGIZOOLOGY = 'Magizoologia',
  DARK_ARTS = 'Artes das Trevas',
  FLIGHT = 'Voo',

  DIVINATION = 'Adivinhação',
  ASTRONOMY = 'Astronomia',
  ANCIENT_RUNES = 'Runas Antigas',
  RITUALS = 'Rituais',

  POTIONS_ALCHEMY = 'Poções',
  HERBOLOGY = 'Herbologia',
  MAGI_MEDICINE = 'Medibruxaria',
  MAGICAL_LANGUAGES = 'Línguas Mágicas',
}

export enum CompetenceKeyEnum {
  APPARITION = 'apparition',
  MAGIZOOLOGY = 'magizoology',
  DARK_ARTS = 'dark_arts',
  FLIGHT = 'flight',

  DIVINATION = 'divination',
  ASTRONOMY = 'astronomy',
  ANCIENT_RUNES = 'ancient_runes',
  RITUALS = 'rituals',

  POTIONS_ALCHEMY = 'potions_alchemy',
  HERBOLOGY = 'herbology',
  MAGI_MEDICINE = 'magi_medicine',
  MAGICAL_LANGUAGES = 'magical_languages',
}

export const {
  displayToKeyMap: competenceDisplayToKeyMap,
  keyToDisplayMap: competenceKeyToDisplayMap,
} = getDisplayKeyMaps(CompetenceDisplayEnum, CompetenceKeyEnum);

export const competenceChoices = Object.keys(CompetenceDisplayEnum).map(
  (competence) => enumToChoice(competence as any, CompetenceDisplayEnum),
);

@Entity()
@ObjectType()
export class Competences implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ default: 0 })
  apparition: number;
  @Field()
  @Column({ default: 0 })
  magizoology: number;
  @Field()
  @Column({ default: 0 })
  dark_arts: number;
  @Field()
  @Column({ default: 0 })
  flight: number;

  @Field()
  @Column({ default: 0 })
  divination: number;
  @Field()
  @Column({ default: 0 })
  astronomy: number;
  @Field()
  @Column({ default: 0 })
  ancient_runes: number;
  @Field()
  @Column({ default: 0 })
  rituals: number;

  @Field()
  @Column({ default: 0 })
  potions_alchemy: number;
  @Field()
  @Column({ default: 0 })
  herbology: number;
  @Field()
  @Column({ default: 0 })
  magi_medicine: number;
  @Field()
  @Column({ default: 0 })
  magical_languages: number;

  @OneToOne(() => Player, (player) => player.competences, {
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
    const embed = new EmbedBuilder().setTitle('Competencias');
    embed.addFields(
      {
        name: `-----`,
        value: `${CompetenceDisplayEnum.APPARITION}: ${this.apparition}\n${CompetenceDisplayEnum.MAGIZOOLOGY}: ${this.magizoology}\n${CompetenceDisplayEnum.DARK_ARTS}: ${this.dark_arts}\n${CompetenceDisplayEnum.FLIGHT}: ${this.apparition}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${CompetenceDisplayEnum.DIVINATION}: ${this.divination}\n${CompetenceDisplayEnum.ASTRONOMY}: ${this.astronomy}\n${CompetenceDisplayEnum.ANCIENT_RUNES}: ${this.ancient_runes}\n${CompetenceDisplayEnum.RITUALS}: ${this.rituals}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${CompetenceDisplayEnum.POTIONS_ALCHEMY}: ${this.potions_alchemy}\n${CompetenceDisplayEnum.HERBOLOGY}: ${this.herbology}\n${CompetenceDisplayEnum.MAGI_MEDICINE}: ${this.magi_medicine}\n${CompetenceDisplayEnum.MAGICAL_LANGUAGES}: ${this.magical_languages}`,
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
