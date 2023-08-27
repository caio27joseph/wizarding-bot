import { Field } from '@nestjs/graphql';
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

export enum AttributeNameEnum {
  STRENGTH = 'Força',
  VIM = 'Vigor',
  DEXTERITY = 'Destreza',
  CHARISMA = 'Carisma',
  MANIPULATION = 'Manipulacao',
  SELFCONTROL = 'Autocontrole',
  INTELLIGENCE = 'Inteligência',
  DETERMINATION = 'Determinação',
  RATIONALITY = 'Raciocínio',
}

export type AttributeNameValue =
  | 'strength'
  | 'vim'
  | 'dexterity'
  | 'charisma'
  | 'manipulation'
  | 'selfcontrol'
  | 'intelligence'
  | 'determination'
  | 'rationality';

export const attributeKeyMap = {
  [AttributeNameEnum.STRENGTH]: 'strength',
  [AttributeNameEnum.VIM]: 'vim',
  [AttributeNameEnum.DEXTERITY]: 'dexterity',
  [AttributeNameEnum.CHARISMA]: 'charisma',
  [AttributeNameEnum.MANIPULATION]: 'manipulation',
  [AttributeNameEnum.SELFCONTROL]: 'selfcontrol',
  [AttributeNameEnum.INTELLIGENCE]: 'intelligence',
  [AttributeNameEnum.DETERMINATION]: 'determination',
  [AttributeNameEnum.RATIONALITY]: 'rationality',
};
export const attributeDisplay = {
  strength: AttributeNameEnum.STRENGTH,
  vim: AttributeNameEnum.VIM,
  dexterity: AttributeNameEnum.DEXTERITY,
  charisma: AttributeNameEnum.CHARISMA,
  manipulation: AttributeNameEnum.MANIPULATION,
  selfcontrol: AttributeNameEnum.SELFCONTROL,
  intelligence: AttributeNameEnum.INTELLIGENCE,
  determination: AttributeNameEnum.DETERMINATION,
  rationality: AttributeNameEnum.RATIONALITY,
};
export const attributeChoices = Object.keys(AttributeNameEnum).map(
  (competence) => enumToChoice(competence as any, AttributeNameEnum),
);

@Entity()
export class Attributes implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  @Field()
  strength: number;
  @Column({ default: 0 })
  @Field()
  vim: number;
  @Column({ default: 0 })
  @Field()
  dexterity: number;
  @Column({ default: 0 })
  @Field()
  charisma: number;
  @Column({ default: 0 })
  @Field()
  manipulation: number;
  @Column({ default: 0 })
  @Field()
  selfcontrol: number;
  @Column({ default: 0 })
  @Field()
  intelligence: number;
  @Column({ default: 0 })
  @Field()
  determination: number;
  @Column({ default: 0 })
  @Field()
  rationality: number;

  @OneToOne(() => Player, (player) => player.attributes, {
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
    const embed = new EmbedBuilder().setTitle('Atributos');
    embed.addFields(
      {
        name: 'Físicos',
        value: `Força: ${this.strength}\nVigor: ${this.vim}\nDestreza: ${this.dexterity}`,
        inline: true,
      },
      {
        name: 'Sociais',
        value: `Carisma: ${this.charisma}\nManipulação: ${this.manipulation}\nAutocontrole: ${this.selfcontrol}`,
        inline: true,
      },
      {
        name: 'Mentais',
        value: `Inteligência: ${this.intelligence}\nDeterminação: ${this.determination}\nRaciocínio: ${this.rationality}`,
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
