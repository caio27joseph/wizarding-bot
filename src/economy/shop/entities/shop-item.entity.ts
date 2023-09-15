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
  BOTH = 'both',
}
export const ShopTypePtBr = {
  [ShopType.SELL]: 'Venda',
  [ShopType.BUY]: 'Compra',
  [ShopType.BOTH]: 'Compra e Venda',
};

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
    default: 0,
  })
  sellPrice: number;

  @ManyToOne(() => Item, {
    eager: true,
  })
  @JoinColumn()
  item: Item;

  @Column({
    default: 1,
  })
  quantity: number;

  @Column({
    type: 'enum',
    enum: ShopType,
  })
  type: ShopType;
}
