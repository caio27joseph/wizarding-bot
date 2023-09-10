import { EmbedBuilder } from 'discord.js';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import {
  ItemPoolConfig,
  ItemPoolRarity,
  ItemPoolRarityPortuguese,
  RarityRatios,
} from './item-pool-config.entity';

@Entity()
export class ItemPool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Guild)
  @JoinColumn()
  guild: Guild;

  @OneToMany(() => ItemPoolConfig, (config) => config.itemPool, {
    eager: true,
  })
  configs: ItemPoolConfig[];

  toEmbed(): EmbedBuilder {
    this.configs = this.configs || [];
    const embed = new EmbedBuilder();
    embed.setTitle(this.name);
    let description = '';
    if (this.configs.length > 0) {
      description += '\n\nItens:\n';
      for (const config of this.configs) {
        description += `\n${config.item.name} - ${
          ItemPoolRarityPortuguese[config.rarity]
        }`;
      }
    }
    embed.setDescription(description);
    return embed;
  }

  async drawItem() {
    const luck = Math.floor(Math.random() * 100);
    const sortedRarities = Object.values(ItemPoolRarity).sort(
      (a, b) => RarityRatios[a] - RarityRatios[b],
    );

    let chosenRarity: ItemPoolRarity;
    for (const rarity of sortedRarities) {
      if (luck <= RarityRatios[rarity]) {
        chosenRarity = rarity;
        break;
      }
    }

    // Start from the chosenRarity and go upwards if no items are found
    const startingIndex = sortedRarities.indexOf(chosenRarity);
    for (let i = startingIndex; i < sortedRarities.length; i++) {
      const rarity = sortedRarities[i];
      const configs = this.configs.filter((config) => config.rarity === rarity);
      if (configs.length > 0) {
        const config = configs[Math.floor(Math.random() * configs.length)];
        config.item.rarity = config.rarity;
        return config.item;
      }
    }

    // Return null or some default value if no items are found in any rarity
    return null;
  }
}
