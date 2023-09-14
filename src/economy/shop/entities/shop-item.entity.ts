import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shop } from './shop.entity';
import { Stack } from '~/items/inventory/entities/stack.entity';
import { Item } from '~/items/item/entities/item.entity';

export enum ShopType {
  SELL = 'sell',
  BUY = 'buy',
}

@Entity()
export class ShopItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shop, (shop) => shop.items)
  @JoinColumn()
  shop: Shop;

  @Column({
    type: 'float',
  })
  buyPrice: number;

  @Column({
    type: 'float',
  })
  sellPrice: number;

  @ManyToOne(() => Item, {
    eager: true,
  })
  @JoinColumn()
  item: Item;

  @Column()
  quantity: number;

  @Column({
    type: 'enum',
    enum: ShopType,
  })
  type: ShopType;
}
