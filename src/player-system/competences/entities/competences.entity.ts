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

export enum CompetencesNameEnum {
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
export const competenceChoices = Object.keys(CompetencesNameEnum).map(
  (competence) => enumToChoice(competence as any, CompetencesNameEnum),
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

  @OneToOne(() => Player, (player) => player.competences)
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
        value: `${CompetencesNameEnum.APPARITION}: ${this.apparition}\n${CompetencesNameEnum.MAGIZOOLOGY}: ${this.magizoology}\n${CompetencesNameEnum.DARK_ARTS}: ${this.dark_arts}\n${CompetencesNameEnum.FLIGHT}: ${this.apparition}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${CompetencesNameEnum.DIVINATION}: ${this.divination}\n${CompetencesNameEnum.ASTRONOMY}: ${this.astronomy}\n${CompetencesNameEnum.ANCIENT_RUNES}: ${this.ancient_runes}\n${CompetencesNameEnum.RITUALS}: ${this.rituals}`,
        inline: true,
      },
      {
        name: `-----`,
        value: `${CompetencesNameEnum.POTIONS_ALCHEMY}: ${this.potions_alchemy}\n${CompetencesNameEnum.HERBOLOGY}: ${this.herbology}\n${CompetencesNameEnum.MAGI_MEDICINE}: ${this.magi_medicine}\n${CompetencesNameEnum.MAGICAL_LANGUAGES}: ${this.magical_languages}`,
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
