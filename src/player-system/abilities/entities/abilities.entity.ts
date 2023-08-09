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
import { DiscordEntityVieable } from '~/discord/types';

export enum AbilitiesNameEnum {
  // Skills
  BLADED_WEAPONS = 'Armas Brancas',
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
  ATHLETICS = 'Atletismo',
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
  THEOLOGICAL_KNOWLEDGE = 'Tecnologia', // Note: 'Conhecimento Teológico' would be a direct translation but this seems to be a mistake in your original enum.
  FINANCES = 'Finanças',
  INVESTIGATION = 'Investigação',
  LINGUISTICS = 'Linguística',
  MEDITATION = 'Meditação',
  MEDICINE = 'Medicina',
  OCCULTISM = 'Ocultismo',
  POLITICS = 'Política',
  TECHNOLOGY = 'Tecnologia',
}
@Entity()
export class Abilities implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //#region skills
  @Column({
    default: 0,
  })
  bladed_weapons: number;
  @Column({
    default: 0,
  })
  fight: number;
  @Column({
    default: 0,
  })
  driving: number;
  @Column({
    default: 0,
  })
  magic_duel: number;
  @Column({
    default: 0,
  })
  dodge: number;
  @Column({
    default: 0,
  })
  stealth: number;
  @Column({
    default: 0,
  })
  crafts: number;
  @Column({
    default: 0,
  })
  aim: number;
  @Column({
    default: 0,
  })
  perception: number;
  @Column({
    default: 0,
  })
  theft: number;
  @Column({
    default: 0,
  })
  survival: number;
  @Column({
    default: 0,
  })
  athletics: number;
  //#endregion

  //#region talents
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
  //#endregion

  //#region knowledge
  @Column({
    default: 0,
  })
  academics: number;
  @Column({
    default: 0,
  })
  sciences: number;
  @Column({
    default: 0,
  })
  cosmology: number;
  @Column({
    default: 0,
  })
  theological_knowledge: number;
  @Column({
    default: 0,
  })
  finances: number;
  @Column({
    default: 0,
  })
  investigation: number;
  @Column({
    default: 0,
  })
  linguistics: number;
  @Column({
    default: 0,
  })
  meditation: number;
  @Column({
    default: 0,
  })
  medicine: number;
  @Column({
    default: 0,
  })
  occultism: number;
  @Column({
    default: 0,
  })
  politics: number;
  @Column({
    default: 0,
  })
  technology: number;
  //#endregion

  @OneToOne(() => Player, (player) => player.abilities)
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
    skills += AbilitiesNameEnum.ATHLETICS + ': ' + this.athletics + '\n';

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
      AbilitiesNameEnum.THEOLOGICAL_KNOWLEDGE +
      ': ' +
      this.theological_knowledge +
      '\n';
    knowledge += AbilitiesNameEnum.FINANCES + ': ' + this.finances + '\n';
    knowledge +=
      AbilitiesNameEnum.INVESTIGATION + ': ' + this.investigation + '\n';
    knowledge += AbilitiesNameEnum.LINGUISTICS + ': ' + this.linguistics + '\n';
    knowledge += AbilitiesNameEnum.MEDITATION + ': ' + this.meditation + '\n';
    knowledge += AbilitiesNameEnum.MEDICINE + ': ' + this.medicine + '\n';
    knowledge += AbilitiesNameEnum.OCCULTISM + ': ' + this.occultism + '\n';
    knowledge += AbilitiesNameEnum.POLITICS + ': ' + this.politics + '\n';
    knowledge += AbilitiesNameEnum.TECHNOLOGY + ': ' + this.technology + '\n';

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
