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

export enum AbilitiesDisplayEnum {
  ACADEMICS = 'Acadêmicos',
  BLADED_WEAPONS = 'Armas Brancas',
  DARK_ARTS = 'Artes das Trevas',
  ATHLETICS = 'Atletismo',
  FIGHT = 'Briga',
  THEOLOGICAL_KNOWLEDGE = 'C. Teológico',
  SCIENCES = 'Ciências',
  DRIVING = 'Condução',
  COSMOLOGY = 'Cosmologia',
  EMPATHY = 'Empatia',
  ETIQUETTE = 'Etiqueta',
  EXPRESSION = 'Expressão',
  FINANCES = 'Finanças',
  STEALTH = 'Furtividade',
  HERBOLOGY = 'Herbologia',
  INTIMIDATION = 'Intimidação',
  INTUITION = 'Intuição',
  INVESTIGATION = 'Investigação',
  BLARNEY = 'Lábia',
  LEADERSHIP = 'Liderança',
  LINGUISTICS = 'Linguística',
  CUNNING = 'Manha',
  MEDICINE = 'Medicina',
  MEDITATION = 'Meditação',
  OCCULTISM = 'Ocultismo',
  CRAFTS = 'Ofícios',
  PERCEPTION = 'Percepção',
  PERFORMANCE = 'Performance',
  PERSUASION = 'Persuasão',
  POLITICS = 'Política',
  AIM = 'Pontaria',
  POTIONS_ALCHEMY = 'Poções/Alquimia',
  RITUALS = 'Rituais',
  THEFT = 'Roubo',
  SURVIVAL = 'Sobrevivência',
  ANIMAL_HANDLING = 'Trato com Animais',
}

export enum AbilitiesKeyEnum {
  ACADEMICS = 'academics',
  BLADED_WEAPONS = 'bladed_weapons',
  DARK_ARTS = 'dark_arts',
  ATHLETICS = 'athletics',
  FIGHT = 'fight',
  THEOLOGICAL_KNOWLEDGE = 'theological_knowledge',
  SCIENCES = 'sciences',
  DRIVING = 'driving',
  COSMOLOGY = 'cosmology',
  EMPATHY = 'empathy',
  ETIQUETTE = 'etiquette',
  EXPRESSION = 'expression',

  FINANCES = 'finances',
  STEALTH = 'stealth',
  HERBOLOGY = 'herbology',
  INTIMIDATION = 'intimidation',
  INTUITION = 'intuition',
  INVESTIGATION = 'investigation',
  BLARNEY = 'blarney',
  LEADERSHIP = 'leadership',
  LINGUISTICS = 'linguistics',
  CUNNING = 'cunning',
  MEDICINE = 'medicine',
  MEDITATION = 'meditation',

  OCCULTISM = 'occultism',
  CRAFTS = 'crafts',
  PERCEPTION = 'perception',
  PERFORMANCE = 'performance',
  PERSUASION = 'persuasion',
  POLITICS = 'politics',
  AIM = 'aim',
  POTIONS_ALCHEMY = 'potions_alchemy',
  RITUALS = 'rituals',
  THEFT = 'theft',
  SURVIVAL = 'survival',
  ANIMAL_HANDLING = 'animal_handling',
}

export type AbilitiesKeys =
  | 'academics'
  | 'bladed_weapons'
  | 'dark_arts'
  | 'athletics'
  | 'fight'
  | 'theological_knowledge'
  | 'sciences'
  | 'driving'
  | 'cosmology'
  | 'empathy'
  | 'dodge'
  | 'etiquette'
  | 'expression'
  | 'finances'
  | 'stealth'
  | 'herbology'
  | 'intimidation'
  | 'intuition'
  | 'investigation'
  | 'blarney'
  | 'leadership'
  | 'linguistics'
  | 'cunning'
  | 'medicine'
  | 'meditation'
  | 'occultism'
  | 'crafts'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'politics'
  | 'aim'
  | 'potions_alchemy'
  | 'theft'
  | 'survival'
  | 'animal_handling';

export const {
  displayToKeyMap: abilitiesDisplayToKeyMap,
  keyToDisplayMap: abilitiesKeyToDisplayMap,
} = getDisplayKeyMaps(AbilitiesDisplayEnum, AbilitiesKeyEnum);

@Entity()
export class Abilities implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  academics: number;
  @Column({ default: 0 })
  bladed_weapons: number;
  @Column({ default: 0 })
  dark_arts: number;
  @Column({ default: 0 })
  athletics: number;
  @Column({ default: 0 })
  fight: number;
  @Column({ default: 0 })
  theological_knowledge: number;
  @Column({ default: 0 })
  sciences: number;
  @Column({ default: 0 })
  driving: number;
  @Column({ default: 0 })
  cosmology: number;
  @Column({ default: 0 })
  empathy: number;
  @Column({ default: 0 })
  etiquette: number;
  @Column({ default: 0 })
  expression: number;
  @Column({ default: 0 })
  finances: number;
  @Column({ default: 0 })
  stealth: number;
  @Column({ default: 0 })
  herbology: number;
  @Column({ default: 0 })
  intimidation: number;
  @Column({ default: 0 })
  intuition: number;
  @Column({ default: 0 })
  investigation: number;
  @Column({ default: 0 })
  blarney: number;
  @Column({ default: 0 })
  leadership: number;
  @Column({ default: 0 })
  linguistics: number;
  @Column({ default: 0 })
  cunning: number;
  @Column({ default: 0 })
  medicine: number;
  @Column({ default: 0 })
  meditation: number;
  @Column({ default: 0 })
  occultism: number;
  @Column({ default: 0 })
  crafts: number;
  @Column({ default: 0 })
  perception: number;
  @Column({ default: 0 })
  performance: number;
  @Column({ default: 0 })
  persuasion: number;
  @Column({ default: 0 })
  politics: number;
  @Column({ default: 0 })
  aim: number;
  @Column({ default: 0 })
  potions_alchemy: number;
  @Column({ default: 0 })
  rituals: number;
  @Column({ default: 0 })
  theft: number;
  @Column({ default: 0 })
  survival: number;
  @Column({ default: 0 })
  animal_handling: number;

  @OneToOne(() => Player, (player) => player.abilities)
  @JoinColumn()
  player: Player;

  @Column()
  playerId: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  toEmbed() {
    const embed = new EmbedBuilder().setTitle('Habilidades');
    const hab1 = Object.entries(abilitiesKeyToDisplayMap)
      .slice(0, 12)
      .map(([key, value]) => {
        return `**${value}:** ${this[key]}`;
      })
      .join('\n');

    const hab2 = Object.entries(abilitiesKeyToDisplayMap)
      .slice(12, 24)
      .map(([key, value]) => {
        return `**${value}:** ${this[key]}`;
      })
      .join('\n');

    const hab3 = Object.entries(abilitiesKeyToDisplayMap)
      .slice(24, 36)
      .map(([key, value]) => {
        return `**${value}:** ${this[key]}`;
      })
      .join('\n');

    embed.addFields(
      {
        name: '---',
        value: hab1,
        inline: true,
      },
      {
        name: '---',
        value: hab2,
        inline: true,
      },
      {
        name: '---',
        value: hab3,
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
