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

export enum ExtrasDisplayEnum {
  WILLPOWER = 'Força de Vontade',
  AFFINITY = 'Afinidade',
  CONTROL = 'Controle',
  SORCERY = 'Feitiçaria',
}
export enum ExtrasKeyEnum {
  WILLPOWER = 'willpower',
  AFFINITY = 'affinity',
  CONTROL = 'control',
  SORCERY = 'sorcery',
}

export const {
  displayToKeyMap: extrasDisplayToKeyMap,
  keyToDisplayMap: extrasKeyToDisplayMap,
} = getDisplayKeyMaps(ExtrasDisplayEnum, ExtrasKeyEnum);

export const extrasChoices = Object.keys(ExtrasDisplayEnum).map((e) =>
  enumToChoice(e as any, ExtrasDisplayEnum),
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
  @JoinColumn()
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
    description += `**${ExtrasDisplayEnum.WILLPOWER}**: ${this.willpower}\n`;
    description += `**${ExtrasDisplayEnum.AFFINITY}**: ${this.affinity}\n`;
    description += `**${ExtrasDisplayEnum.CONTROL}**: ${this.control}\n`;
    description += `**${ExtrasDisplayEnum.SORCERY}**: ${this.sorcery}\n`;
    embed.setDescription(description);
    return embed;
  }
  reply(interaction: Interaction) {
    return new MessagePayload(interaction, {
      embeds: [this.toEmbed()],
    });
  }
}
