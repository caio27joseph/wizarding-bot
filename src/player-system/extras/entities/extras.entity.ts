import { Field } from '@nestjs/graphql';
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

export enum ExtrasNameEnum {
  WILLPOWER = 'Força de Vontade',
  AFFINITY = 'Afinidade',
  CONTROL = 'Controle',
  SORCERY = 'Feitiçaria',
}

export const extrasChoices = Object.keys(ExtrasNameEnum).map((e) =>
  enumToChoice(e as any, ExtrasNameEnum),
);

@Entity()
export class Extras implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  @Field()
  willpower: number;
  @Column({ default: 0 })
  @Field()
  affinity: number;
  @Column({ default: 0 })
  @Field()
  control: number;
  @Column({ default: 0 })
  @Field()
  sorcery: number;

  @OneToOne(() => Player, (player) => player.extras, {
    cascade: true,
  })
  player: Player;

  @Column()
  playerId: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  toEmbed() {
    const embed = new EmbedBuilder().setTitle('Extras');
    let description = '';
    description += `**${ExtrasNameEnum.WILLPOWER}**: ${this.willpower}\n`;
    description += `**${ExtrasNameEnum.AFFINITY}**: ${this.affinity}\n`;
    description += `**${ExtrasNameEnum.CONTROL}**: ${this.control}\n`;
    description += `**${ExtrasNameEnum.SORCERY}**: ${this.sorcery}\n`;
    embed.setDescription(description);
    return embed;
  }
  reply(interaction: Interaction) {
    return new MessagePayload(interaction, {
      embeds: [this.toEmbed()],
    });
  }
}
