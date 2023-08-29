import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
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

  toEmbed() {
    const embed = new EmbedBuilder();
    embed.setTitle(this.item.name);
    embed.setDescription(`***Quantidade***: ${this.quantity}`);

    return embed;
  }
}
