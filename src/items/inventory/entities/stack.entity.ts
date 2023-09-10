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
import { ItemPoolRarityColors } from '~/items/item-pool/entitites/item-pool-config.entity';

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
      description += `Raridade: ${this.item.rarity}\n`;
    } else {
      embed.setColor(`White`);
    }
    description += `Total: ${this.quantity}`;
    embed.setDescription(description);
    return embed;
  }
}
