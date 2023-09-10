import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from '~/items/item/entities/item.entity';
import { ItemPool } from './item-pool.entity';
import { ColorResolvable } from 'discord.js';

export enum ItemPoolRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  LEGENDARY = 'legendary',
}

export const ItemPoolRarityPortuguese = {
  [ItemPoolRarity.COMMON]: 'Comum',
  [ItemPoolRarity.UNCOMMON]: 'Incomum',
  [ItemPoolRarity.RARE]: 'Raro',
  [ItemPoolRarity.LEGENDARY]: 'Lendário',
};

// All values are in percentage
export const RarityRatios = {
  [ItemPoolRarity.COMMON]: 80,
  [ItemPoolRarity.UNCOMMON]: 15,
  [ItemPoolRarity.RARE]: 4,
  [ItemPoolRarity.LEGENDARY]: 1,
};

export const ItemPoolRarityColors: {
  [key in ItemPoolRarity]: ColorResolvable;
} = {
  [ItemPoolRarity.COMMON]: 'White',
  [ItemPoolRarity.UNCOMMON]: 'Blue',
  [ItemPoolRarity.RARE]: 'Gold',
  [ItemPoolRarity.LEGENDARY]: 'Purple',
};

@Entity()
export class ItemPoolConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Item, {
    eager: true,
  })
  @JoinColumn()
  item: Item;

  @ManyToOne(() => ItemPool, (itemPool) => itemPool.configs)
  @JoinColumn()
  itemPool: ItemPool;

  @Column({
    type: 'enum',
    enum: ItemPoolRarity,
  })
  rarity: ItemPoolRarity;

  get ratio() {
    return RarityRatios[this.rarity];
  }
}
