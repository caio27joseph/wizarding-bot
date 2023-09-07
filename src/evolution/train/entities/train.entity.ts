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
import { Spell } from '~/spell/entities/spell.entity';

export enum TrainGroupOption {
  SOLO = 'Solo',
  DUO = 'Dupla',
  TRIO = 'Trio',
  GROUP = 'Grupo',
  TUTOR = 'Tutor',
  PROFESSOR = 'Professor',
  Direto = 'Direto',
}

enum SpellDifficultyEnum {
  EASY = 'Fácil',
  MEDIUM = 'Médio',
  HARD = 'Difícil',
  VERY_HARD = 'Muito Difícil',
}
@Entity()
export class Train implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  messageId?: string;

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

  toShortText() {
    return (
      `Treino de ${this.spell.name}, XP Concedido ${this.xp}` +
      `\n${this.xpExpression}`
    );
  }

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
    embed.setFields(
      {
        name: 'Estilo de Treino',
        value: this.group,
      },
      {
        name: 'ID',
        value: this.id,
      },
    );

    return embed;
  }
  static readonly groupXpMap = {
    [TrainGroupOption.SOLO]: 0,
    [TrainGroupOption.DUO]: 6,
    [TrainGroupOption.TRIO]: 8,
    [TrainGroupOption.GROUP]: 10,
    [TrainGroupOption.Direto]: 0,
  };
  static readonly spellDifficultyXpMap = {
    [SpellDifficultyEnum.EASY]: 4,
    [SpellDifficultyEnum.MEDIUM]: 8,
    [SpellDifficultyEnum.HARD]: 12,
    [SpellDifficultyEnum.VERY_HARD]: 16,
  };
  @Column({
    default: false,
  })
  double: boolean;

  get xpExpression() {
    if (this.spellId) {
      let expression =
        `${this.success} Sucessos * ${this.spell.level} Nível do Feitiço` +
        ` + ${Train.spellDifficultyXpMap[this.spell.difficulty]}${
          this.double ? 'x2' : ''
        } Dificuldade do Feitiço`;

      if (this.group === TrainGroupOption.TUTOR) {
        expression = '(' + expression + ') * 2 Tutor';
      } else if (this.group === TrainGroupOption.PROFESSOR) {
        expression = '(' + expression + ') * 4 Professor';
      } else {
        expression +=
          ' + ' +
          Train.groupXpMap[this.group] +
          `${this.double ? 'x2' : ''}` +
          ` ${this.group}`;
      }
      return expression;
    }
  }

  @BeforeInsert()
  setXp() {
    if (this.xp) return this.xp;
    if (this.spell) {
      let xp =
        this.success * this.spell.level +
        Train.spellDifficultyXpMap[this.spell.difficulty] *
          (this.double ? 2 : 1);
      if (this.group === TrainGroupOption.TUTOR) {
        xp *= 2;
      } else if (this.group === TrainGroupOption.PROFESSOR) {
        xp *= 4;
      } else {
        xp += Train.groupXpMap[this.group] * (this.double ? 2 : 1);
      }
      this.xp = xp;
    }
  }

  reply(interaction: Interaction) {
    throw new Error('Method not implemented.');
  }
}
