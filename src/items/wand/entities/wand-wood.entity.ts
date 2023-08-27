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
  BonusTarget,
  BonusHelper,
} from '~/items/bonuses/item-with-bonus.interface';

@Entity()
export class WandWood {
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
  wood_description: string;
  @Column()
  characteristics: string;
  @Column()
  core_combinations: string;
  @Column()
  magic_schools: string;
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
      this.wood_description &&
      description.length + this.wood_description.length < 1900
    ) {
      description += `## Descrição\n${this.wood_description}\n\n`;
    }
    if (
      this.characteristics &&
      description.length + this.characteristics.length < 1900
    ) {
      description += `### Características\n ${this.characteristics}\n\n`;
    }
    if (
      this.core_combinations &&
      description.length + this.core_combinations.length < 1900
    ) {
      description += `### Combinações de núcleo\n ${this.core_combinations}\n\n`;
    }
    if (
      this.magic_schools &&
      description.length + this.magic_schools.length < 1900
    ) {
      description += `### Escolas de magia\n ${this.magic_schools}\n\n`;
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

    if (this.wood_description && description.length < 1400) {
      description += `## Descrição\n${this.wood_description}\n\n`;
    }
    if (this.characteristics && description.length < 1400) {
      description += `### Características\n ${this.characteristics}\n\n`;
    } else {
      embeds.push(
        new EmbedBuilder()
          .setTitle('Características')
          .setDescription(this.characteristics),
      );
    }
    if (this.core_combinations && description.length < 1400) {
      description += `### Combinações de núcleo\n ${this.core_combinations}\n\n`;
    } else {
      embeds.push(
        new EmbedBuilder()
          .setTitle('Combinações de núcleo')
          .setDescription(this.core_combinations),
      );
    }
    if (this.magic_schools && description.length < 1400) {
      description += `### Escolas de magia\n ${this.magic_schools}\n\n`;
    } else {
      embeds.push(
        new EmbedBuilder()
          .setTitle('Escolas de magia')
          .setDescription(this.magic_schools),
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
