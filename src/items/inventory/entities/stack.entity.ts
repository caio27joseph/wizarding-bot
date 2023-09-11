import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from '~/items/item/entities/item.entity';
import { Inventory } from './inventory.entity';
import { EmbedBuilder } from 'discord.js';
import {
  ItemPoolRarityColors,
  ItemPoolRarityPortuguese,
} from '~/items/item-pool/entitites/item-pool-config.entity';

@Entity()
export class Stack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Inventory, (iv) => iv.stacks)
  @JoinColumn()
  inventory: Inventory;

  @Column()
  inventoryId: string;

  @ManyToOne(() => Item, {
    eager: true,
  })
  @JoinColumn()
  item: Item;

  @Column({
    default: 1,
    type: 'smallint',
  })
  quantity: number;

  @UpdateDateColumn()
  updatedAt: Date;

  toEmbed() {
    const embed = new EmbedBuilder();
    embed.setTitle(this.item.name);
    let description = '';
    embed.setThumbnail(this.item.imageUrl);
    if (this.item.rarity) {
      embed.setColor(ItemPoolRarityColors[this.item.rarity]);
      description += `Raridade: ${
        ItemPoolRarityPortuguese[this.item.rarity]
      }\n`;
    } else {
      embed.setColor(`White`);
    }
    description += `Total: ${this.quantity}`;
    // splice and add ellipsis if description is too longe than 500
    description += this.item.description.slice(0, 500);
    if (this.item.description.length > 500) {
      description += '...';
    }

    embed.setDescription(description);
    return embed;
  }
}
