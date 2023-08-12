import { Field } from '@nestjs/graphql';
import { EmbedBuilder, Interaction } from 'discord.js';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordEntityVieable } from '~/discord/types';
import { Spell, SpellDifficultyEnum } from '~/spell/entities/spell.entity';

export enum TrainGroupOption {
  SOLO = 'Solo',
  DUO = 'Dupla',
  TRIO = 'Trio',
  GROUP = 'Grupo',
  TUTOR = 'Tutor',
  PROFESSOR = 'Professor',
}

@Entity()
export class Train implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  messageId: string;

  @Column()
  channelId: string;

  @Column()
  xp: number;

  @ManyToOne(() => Player, (player) => player.trains, { eager: true })
  player: Player;

  @Column()
  playerId: string;

  @ManyToOne(() => Spell, (spell) => spell.trains, {
    nullable: true,
    eager: true,
  })
  spell?: Spell;

  @Column({
    nullable: true,
  })
  spellId: string;

  @Column({
    default: 0,
  })
  success: number;

  @Column({
    type: 'enum',
    enum: TrainGroupOption,
  })
  @Field((type) => TrainGroupOption)
  group: TrainGroupOption;

  @CreateDateColumn()
  createdAt: Date;

  xpExpression?: string;

  toEmbed() {
    const embed = new EmbedBuilder();
    embed.setAuthor({
      name: this.player.name,
      iconURL: this.player.avatarUrl,
    });
    if (this.spell) {
      embed.setTitle(`Treino de ${this.spell.name}`);
    }
    embed.setDescription(`XP Concedido ${this.xp}` + `\n${this.xpExpression}`);
    embed.setFields({
      name: 'Estilo de Treino',
      value: this.group,
    });

    return embed;
  }
  static readonly groupXpMap = {
    [TrainGroupOption.SOLO]: 0,
    [TrainGroupOption.DUO]: 6,
    [TrainGroupOption.TRIO]: 8,
    [TrainGroupOption.GROUP]: 10,
  };
  static readonly spellDifficultyXpMap = {
    [SpellDifficultyEnum.EASY]: 4,
    [SpellDifficultyEnum.MEDIUM]: 8,
    [SpellDifficultyEnum.HARD]: 12,
    [SpellDifficultyEnum.VERY_HARD]: 16,
  };

  @BeforeInsert()
  setXp() {
    if (this.spell) {
      let expression =
        `${this.success} Sucessos * ${this.spell.level} Nível do Feitiço` +
        ` + ${
          Train.spellDifficultyXpMap[this.spell.difficulty]
        } Dificuldade do Feitiço`;
      let xp =
        this.success * this.spell.level +
        Train.spellDifficultyXpMap[this.spell.difficulty];
      if (this.group === TrainGroupOption.TUTOR) {
        xp *= 2;
        expression = '(' + expression + ') * 2 Tutor';
      } else if (this.group === TrainGroupOption.PROFESSOR) {
        xp *= 4;
        expression = '(' + expression + ') * 4 Professor';
      } else {
        xp += Train.groupXpMap[this.group];
        expression += ' + ' + Train.groupXpMap[this.group] + ' Grupo';
      }
      this.xp = xp;
      this.xpExpression = expression;
    }
  }

  reply(interaction: Interaction) {
    throw new Error('Method not implemented.');
  }
}
