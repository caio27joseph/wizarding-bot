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
import { getDisplayKeyMaps } from '~/utils/entity-types';

export enum AttributeDisplayEnum {
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
export enum AttributeKeyEnum {
  STRENGTH = 'strength',
  VIM = 'vim',
  DEXTERITY = 'dexterity',
  CHARISMA = 'charisma',
  MANIPULATION = 'manipulation',
  SELFCONTROL = 'selfcontrol',
  INTELLIGENCE = 'intelligence',
  DETERMINATION = 'determination',
  RATIONALITY = 'rationality',
}

export const {
  displayToKeyMap: attributeDisplayToKeyMap,
  keyToDisplayMap: attributeKeyToDisplayMap,
} = getDisplayKeyMaps(AttributeDisplayEnum, AttributeKeyEnum);

export type AttributeKeyType =
  | 'strength'
  | 'vim'
  | 'dexterity'
  | 'charisma'
  | 'manipulation'
  | 'selfcontrol'
  | 'intelligence'
  | 'determination'
  | 'rationality';

export const attributeChoices = Object.keys(AttributeDisplayEnum).map(
  (competence) => enumToChoice(competence as any, AttributeDisplayEnum),
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
