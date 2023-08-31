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
    embed.setDescription(`***Quantidade Total***: ${this.quantity}`);
    embed.setThumbnail(this.item.imageUrl);
    embed.setColor(`White`);
    return embed;
  }
}
