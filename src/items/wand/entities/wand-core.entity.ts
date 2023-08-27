import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { groupBy } from 'lodash';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import {
  Bonus,
  BonusHelper,
  BonusTarget,
} from '~/items/bonuses/item-with-bonus.interface';

@Entity()
export class WandCore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Guild)
  @JoinColumn()
  guild: Guild;

  @Column()
  guildId: string;

  @Column()
  name: string;
  @Column()
  rarity: string;
  @Column()
  description: string;
  @Column()
  characteristics: string;
  @Column()
  special_effect: string;
  @Column()
  critical_success: string;
  @Column()
  critical_failure: string;
  @Column()
  identifier: string;
  @Column()
  updatedAt: Date;

  @Column({
    type: 'json',
    default: [],
  })
  bonuses: Bonus<BonusTarget>[];

  toText() {
    let description = `# ${this.name}\n`;
    description += `> **Raridade:** ${this.rarity}\n\n`;

    if (
      this.description &&
      description.length + this.description.length < 1900
    ) {
      description += `## Descrição\n${this.description}\n\n`;
    }
    if (
      this.characteristics &&
      description.length + this.characteristics.length < 1900
    ) {
      description += `### Características\n ${this.characteristics}\n\n`;
    }
    if (
      this.special_effect &&
      description.length + this.special_effect.length < 1900
    ) {
      description += `### Combinações de núcleo\n ${this.special_effect}\n\n`;
    }
    if (
      this.critical_success &&
      description.length + this.critical_success.length < 1900
    ) {
      description += `### Escolas de magia\n ${this.critical_success}\n\n`;
    }
    if (this.bonuses.length) {
      const fieldsMap = groupBy(
        this.bonuses.map((b) => new BonusHelper(b).toEmbedField()),
        (v) => v.name,
      );
      const fields = [];
      for (const key in fieldsMap) {
        const value = fieldsMap[key].map((v) => v.value).join('\n');
        fields.push({
          name: key,
          value,
          inline: false,
        });
      }
      fields.forEach((f) => {
        description += `### ${f.name}\n${f.value}\n`;
      });
    }
    return description;
  }

  toReply(): InteractionReplyOptions {
    let description = `# ${this.name}\n`;
    description += `> **Raridade:** ${this.rarity}\n\n`;
    const embeds: EmbedBuilder[] = [];

    if (this.description && description.length < 1400) {
      description += `## Descrição\n${this.description}\n\n`;
    }
    if (
      this.characteristics &&
      description.length + this.characteristics.length < 1900
    ) {
      description += `### Características\n ${this.characteristics}\n\n`;
    } else {
      embeds.push(
        new EmbedBuilder()
          .setTitle('Características')
          .setDescription(this.characteristics),
      );
    }
    if (
      this.special_effect &&
      description.length + this.special_effect.length < 1900
    ) {
      description += `### Efeito Especial\n ${this.special_effect}\n\n`;
    } else {
      embeds.push(
        new EmbedBuilder()
          .setTitle('Efeito Especial')
          .setDescription(this.special_effect),
      );
    }
    if (
      this.critical_success &&
      description.length + this.critical_success.length < 1900
    ) {
      description += `### Sucesso Crítico\n ${this.critical_success}\n\n`;
    } else {
      embeds.push(
        new EmbedBuilder()
          .setTitle('Sucesso Crítico')
          .setDescription(this.critical_success),
      );
    }
    if (
      this.critical_failure &&
      description.length + this.critical_failure.length < 1900
    ) {
      description += `### Falha Crítica\n ${this.critical_failure}\n\n`;
    } else {
      embeds.push(
        new EmbedBuilder()
          .setTitle('Falha Crítica')
          .setDescription(this.critical_failure),
      );
    }

    if (this.bonuses.length) {
      const fieldsMap = groupBy(
        this.bonuses.map((b) => new BonusHelper(b).toEmbedField()),
        (v) => v.name,
      );
      const fields = [];
      for (const key in fieldsMap) {
        const value = fieldsMap[key].map((v) => v.value).join('\n');
        fields.push({
          name: key,
          value,
          inline: false,
        });
      }
      embeds.push(new EmbedBuilder().setTitle('Bônus').addFields(...fields));
    }
    return {
      content: description,
      embeds,
    };
  }
}
