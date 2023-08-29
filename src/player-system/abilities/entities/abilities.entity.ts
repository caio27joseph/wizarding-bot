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

export enum SkillDisplayEnum {
  BLADED_WEAPONS = 'Armas Brancas',
  ATHLETICS = 'Atletismo',
  FIGHT = 'Briga',
  DRIVING = 'Condução',
  MAGIC_DUEL = 'Duelo Mágico',
  DODGE = 'Esquiva',
  STEALTH = 'Furtividade',
  CRAFTS = 'Ofícios',
  AIM = 'Pontaria',
  PERCEPTION = 'Percepção',
  THEFT = 'Roubo',
  SURVIVAL = 'Sobrevivência',
}

export enum SkillKeyEnum {
  BLADED_WEAPONS = 'bladed_weapons',
  ATHLETICS = 'athletics',
  FIGHT = 'fight',
  DRIVING = 'driving',
  MAGIC_DUEL = 'magic_duel',
  DODGE = 'dodge',
  STEALTH = 'stealth',
  CRAFTS = 'crafts',
  AIM = 'aim',
  PERCEPTION = 'perception',
  THEFT = 'theft',
  SURVIVAL = 'survival',
}

export const {
  displayToKeyMap: skillDisplayToKeyMap,
  keyToDisplayMap: skillKeyToDisplayMap,
} = getDisplayKeyMaps(SkillDisplayEnum, SkillKeyEnum);

export enum TalentDisplayEnum {
  EXPRESSION = 'Expressão',
  EMPATHY = 'Empatia',
  ETIQUETTE = 'Etiqueta',
  INTIMIDATION = 'Intimidação',
  INTUITION = 'Intuição',
  SWEET_TALK = 'Lábia',
  LEADERSHIP = 'Liderança',
  CUNNING = 'Manha',
  PERFORMANCE = 'Performance',
  PERSUASION = 'Persuasão',
  SLEIGHT_OF_HAND = 'Prestidigitação',
  ANIMAL_HANDLING = 'Trato com Animais',
}

export enum TalentKeyEnum {
  EXPRESSION = 'expression',
  EMPATHY = 'empathy',
  ETIQUETTE = 'etiquette',
  INTIMIDATION = 'intimidation',
  INTUITION = 'intuition',
  SWEET_TALK = 'sweet_talk',
  LEADERSHIP = 'leadership',
  CUNNING = 'cunning',
  PERFORMANCE = 'performance',
  PERSUASION = 'persuasion',
  SLEIGHT_OF_HAND = 'sleight_of_hand',
  ANIMAL_HANDLING = 'animal_handling',
}

export const {
  displayToKeyMap: talentDisplayToKeyMap,
  keyToDisplayMap: talentKeyToDisplayMap,
} = getDisplayKeyMaps(TalentDisplayEnum, TalentKeyEnum);

export enum KnowledgeDisplayEnum {
  ACADEMICS = 'Acadêmicos',
  SCIENCES = 'Ciências',
  COSMOLOGY = 'Cosmologia',
  TECHNOLOGY = 'Tecnologia',
  FINANCES = 'Finanças',
  INVESTIGATION = 'Investigação',
  LINGUISTICS = 'Linguística',
  MEDITATION = 'Meditação',
  MEDICINE = 'Medicina',
  OCCULTISM = 'Ocultismo',
  POLITICS = 'Política',
  THEOLOGICAL_KNOWLEDGE = 'Con Teologico', // Note: 'Conhecimento Teológico' would be a direct translation but this seems to be a mistake in your original enum.
}

export enum KnowledgeKeyEnum {
  ACADEMICS = 'academics',
  SCIENCES = 'sciences',
  COSMOLOGY = 'cosmology',
  TECHNOLOGY = 'technology',
  FINANCES = 'finances',
  INVESTIGATION = 'investigation',
  LINGUISTICS = 'linguistics',
  MEDITATION = 'meditation',
  MEDICINE = 'medicine',
  OCCULTISM = 'occultism',
  POLITICS = 'politics',
  THEOLOGICAL_KNOWLEDGE = 'theological_knowledge',
}

export const {
  displayToKeyMap: knowledgeDisplayToKeyMap,
  keyToDisplayMap: knowledgeKeyToDisplayMap,
} = getDisplayKeyMaps(KnowledgeDisplayEnum, KnowledgeKeyEnum);

export enum AbilitiesNameEnum {
  // Skills
  BLADED_WEAPONS = 'Armas Brancas',
  ATHLETICS = 'Atletismo',
  FIGHT = 'Briga',
  DRIVING = 'Condução',
  MAGIC_DUEL = 'Duelo Mágico',
  DODGE = 'Esquiva',
  STEALTH = 'Furtividade',
  CRAFTS = 'Ofícios',
  AIM = 'Pontaria',
  PERCEPTION = 'Percepção',
  THEFT = 'Roubo',
  SURVIVAL = 'Sobrevivência',
  // Talents
  EXPRESSION = 'Expressão',
  EMPATHY = 'Empatia',
  ETIQUETTE = 'Etiqueta',
  INTIMIDATION = 'Intimidação',
  INTUITION = 'Intuição',
  SWEET_TALK = 'Lábia',
  LEADERSHIP = 'Liderança',
  CUNNING = 'Manha',
  PERFORMANCE = 'Performance',
  PERSUASION = 'Persuasão',
  SLEIGHT_OF_HAND = 'Prestidigitação',
  ANIMAL_HANDLING = 'Trato com Animais',
  // Knowledge
  ACADEMICS = 'Acadêmicos',
  SCIENCES = 'Ciências',
  COSMOLOGY = 'Cosmologia',
  TECHNOLOGY = 'Tecnologia',
  FINANCES = 'Finanças',
  INVESTIGATION = 'Investigação',
  LINGUISTICS = 'Linguística',
  MEDITATION = 'Meditação',
  MEDICINE = 'Medicina',
  OCCULTISM = 'Ocultismo',
  POLITICS = 'Política',
  THEOLOGICAL_KNOWLEDGE = 'Con Teologico', // Note: 'Conhecimento Teológico' would be a direct translation but this seems to be a mistake in your original enum.
}

export type SkillNameValue =
  | 'bladed_weapons'
  | 'athletics'
  | 'fight'
  | 'driving'
  | 'magic_duel'
  | 'dodge'
  | 'stealth'
  | 'crafts'
  | 'aim'
  | 'perception'
  | 'theft'
  | 'survival';

export type TalentNameValue =
  | 'expression'
  | 'empathy'
  | 'etiquette'
  | 'intimidation'
  | 'intuition'
  | 'sweet_talk'
  | 'leadership'
  | 'cunning'
  | 'performance'
  | 'persuasion'
  | 'sleight_of_hand'
  | 'animal_handling';

export type KnowledgeNameValue =
  | 'academics'
  | 'sciences'
  | 'cosmology'
  | 'technology'
  | 'finances'
  | 'investigation'
  | 'linguistics'
  | 'meditation'
  | 'medicine'
  | 'occultism'
  | 'politics'
  | 'theological_knowledge';

export type AbilityNameValue =
  | SkillNameValue
  | TalentNameValue
  | KnowledgeNameValue;

// Separate abilities by type
const skillAbilities = [
  AbilitiesNameEnum.BLADED_WEAPONS,
  AbilitiesNameEnum.ATHLETICS,
  AbilitiesNameEnum.FIGHT,
  AbilitiesNameEnum.DRIVING,
  AbilitiesNameEnum.MAGIC_DUEL,
  AbilitiesNameEnum.DODGE,
  AbilitiesNameEnum.STEALTH,
  AbilitiesNameEnum.CRAFTS,
  AbilitiesNameEnum.AIM,
  AbilitiesNameEnum.PERCEPTION,
  AbilitiesNameEnum.THEFT,
  AbilitiesNameEnum.SURVIVAL,
];

const talentAbilities = [
  AbilitiesNameEnum.EXPRESSION,
  AbilitiesNameEnum.EMPATHY,
  AbilitiesNameEnum.ETIQUETTE,
  AbilitiesNameEnum.INTIMIDATION,
  AbilitiesNameEnum.INTUITION,
  AbilitiesNameEnum.SWEET_TALK,
  AbilitiesNameEnum.LEADERSHIP,
  AbilitiesNameEnum.CUNNING,
  AbilitiesNameEnum.PERFORMANCE,
  AbilitiesNameEnum.PERSUASION,
  AbilitiesNameEnum.SLEIGHT_OF_HAND,
  AbilitiesNameEnum.ANIMAL_HANDLING,
];

const knowledgeAbilities = [
  AbilitiesNameEnum.ACADEMICS,
  AbilitiesNameEnum.SCIENCES,
  AbilitiesNameEnum.COSMOLOGY,
  AbilitiesNameEnum.TECHNOLOGY,
  AbilitiesNameEnum.FINANCES,
  AbilitiesNameEnum.INVESTIGATION,
  AbilitiesNameEnum.LINGUISTICS,
  AbilitiesNameEnum.MEDITATION,
  AbilitiesNameEnum.MEDICINE,
  AbilitiesNameEnum.OCCULTISM,
  AbilitiesNameEnum.POLITICS,
  AbilitiesNameEnum.THEOLOGICAL_KNOWLEDGE,
];
type EnumKeys<T> = { [key in keyof T]: string };

function getEnumKeysFromValues<EnumType>(
  enumObj: EnumType,
  values: Array<EnumType[keyof EnumType]>,
): Array<keyof EnumType> {
  const keysArray: Array<keyof EnumType> = [];
  for (const key in enumObj) {
    if (values.includes(enumObj[key])) {
      keysArray.push(key as keyof EnumType);
    }
  }
  return keysArray;
}

const knowledgeAbilityKeys = getEnumKeysFromValues(
  AbilitiesNameEnum,
  knowledgeAbilities,
);

const talentAbilityKeys = getEnumKeysFromValues(
  AbilitiesNameEnum,
  talentAbilities,
);

const skillAbilityKeys = getEnumKeysFromValues(
  AbilitiesNameEnum,
  skillAbilities,
);
// Convert each array of abilities to choices
export const skillChoices = skillAbilityKeys.map((ability) =>
  enumToChoice(ability as any, AbilitiesNameEnum),
);

export const talentChoices = talentAbilityKeys.map((ability) =>
  enumToChoice(ability as any, AbilitiesNameEnum),
);

export const knowledgeChoices = knowledgeAbilityKeys.map((ability) =>
  enumToChoice(ability as any, AbilitiesNameEnum),
);

@Entity()
export class Abilities implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  bladed_weapons: number;
  @Column({ default: 0 })
  athletics: number;
  @Column({ default: 0 })
  fight: number;
  @Column({ default: 0 })
  driving: number;
  @Column({ default: 0 })
  magic_duel: number;
  @Column({ default: 0 })
  dodge: number;
  @Column({ default: 0 })
  stealth: number;
  @Column({ default: 0 })
  crafts: number;
  @Column({ default: 0 })
  aim: number;
  @Column({ default: 0 })
  perception: number;
  @Column({ default: 0 })
  theft: number;
  @Column({ default: 0 })
  survival: number;

  @Column({ default: 0 })
  expression: number;
  @Column({ default: 0 })
  empathy: number;
  @Column({ default: 0 })
  etiquette: number;
  @Column({ default: 0 })
  intimidation: number;
  @Column({ default: 0 })
  intuition: number;
  @Column({ default: 0 })
  sweet_talk: number;
  @Column({ default: 0 })
  leadership: number;
  @Column({ default: 0 })
  cunning: number;
  @Column({ default: 0 })
  performance: number;
  @Column({ default: 0 })
  persuasion: number;
  @Column({ default: 0 })
  sleight_of_hand: number;
  @Column({ default: 0 })
  animal_handling: number;

  @Column({ default: 0 })
  academics: number;
  @Column({ default: 0 })
  sciences: number;
  @Column({ default: 0 })
  cosmology: number;
  @Column({ default: 0 })
  technology: number;
  @Column({ default: 0 })
  finances: number;
  @Column({ default: 0 })
  investigation: number;
  @Column({ default: 0 })
  linguistics: number;
  @Column({ default: 0 })
  meditation: number;
  @Column({ default: 0 })
  medicine: number;
  @Column({ default: 0 })
  occultism: number;
  @Column({ default: 0 })
  politics: number;
  @Column({ default: 0 })
  theological_knowledge: number;

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
    let skills = '';
    skills +=
      AbilitiesNameEnum.BLADED_WEAPONS + ': ' + this.bladed_weapons + '\n';
    skills += AbilitiesNameEnum.ATHLETICS + ': ' + this.athletics + '\n';
    skills += AbilitiesNameEnum.FIGHT + ': ' + this.fight + '\n';
    skills += AbilitiesNameEnum.DRIVING + ': ' + this.driving + '\n';
    skills += AbilitiesNameEnum.MAGIC_DUEL + ': ' + this.magic_duel + '\n';
    skills += AbilitiesNameEnum.DODGE + ': ' + this.dodge + '\n';
    skills += AbilitiesNameEnum.STEALTH + ': ' + this.stealth + '\n';
    skills += AbilitiesNameEnum.CRAFTS + ': ' + this.crafts + '\n';
    skills += AbilitiesNameEnum.AIM + ': ' + this.aim + '\n';
    skills += AbilitiesNameEnum.PERCEPTION + ': ' + this.perception + '\n';
    skills += AbilitiesNameEnum.THEFT + ': ' + this.theft + '\n';
    skills += AbilitiesNameEnum.SURVIVAL + ': ' + this.survival + '\n';

    let talents = '';
    talents += AbilitiesNameEnum.EXPRESSION + ': ' + this.expression + '\n';
    talents += AbilitiesNameEnum.EMPATHY + ': ' + this.empathy + '\n';
    talents += AbilitiesNameEnum.ETIQUETTE + ': ' + this.etiquette + '\n';
    talents += AbilitiesNameEnum.INTIMIDATION + ': ' + this.intimidation + '\n';
    talents += AbilitiesNameEnum.INTUITION + ': ' + this.intuition + '\n';
    talents += AbilitiesNameEnum.SWEET_TALK + ': ' + this.sweet_talk + '\n';
    talents += AbilitiesNameEnum.LEADERSHIP + ': ' + this.leadership + '\n';
    talents += AbilitiesNameEnum.CUNNING + ': ' + this.cunning + '\n';
    talents += AbilitiesNameEnum.PERFORMANCE + ': ' + this.performance + '\n';
    talents += AbilitiesNameEnum.PERSUASION + ': ' + this.persuasion + '\n';
    talents +=
      AbilitiesNameEnum.SLEIGHT_OF_HAND + ': ' + this.sleight_of_hand + '\n';
    talents +=
      AbilitiesNameEnum.ANIMAL_HANDLING + ': ' + this.animal_handling + '\n';

    let knowledge = '';
    knowledge += AbilitiesNameEnum.ACADEMICS + ': ' + this.academics + '\n';
    knowledge += AbilitiesNameEnum.SCIENCES + ': ' + this.sciences + '\n';
    knowledge += AbilitiesNameEnum.COSMOLOGY + ': ' + this.cosmology + '\n';
    knowledge +=
      AbilitiesNameEnum.TECHNOLOGY + ': ' + this.theological_knowledge + '\n';
    knowledge += AbilitiesNameEnum.FINANCES + ': ' + this.finances + '\n';
    knowledge +=
      AbilitiesNameEnum.INVESTIGATION + ': ' + this.investigation + '\n';
    knowledge += AbilitiesNameEnum.LINGUISTICS + ': ' + this.linguistics + '\n';
    knowledge += AbilitiesNameEnum.MEDITATION + ': ' + this.meditation + '\n';
    knowledge += AbilitiesNameEnum.MEDICINE + ': ' + this.medicine + '\n';
    knowledge += AbilitiesNameEnum.OCCULTISM + ': ' + this.occultism + '\n';
    knowledge += AbilitiesNameEnum.POLITICS + ': ' + this.politics + '\n';
    knowledge +=
      AbilitiesNameEnum.THEOLOGICAL_KNOWLEDGE + ': ' + this.technology + '\n';

    embed.addFields(
      {
        name: 'Perícias',
        value: skills,
        inline: true,
      },
      {
        name: 'Talentos',
        value: talents,
        inline: true,
      },
      {
        name: 'Conhecimentos',
        value: knowledge,
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
