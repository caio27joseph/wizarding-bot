import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { Space } from '~/spaces/space/entities/space.entity';

@Entity()
export class ItemDrop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Item)
  @JoinColumn()
  item: Item;

  @Column()
  itemId: string;

  @ManyToOne(() => Space, (space) => space.itemDrops)
  @JoinColumn()
  space: Space;

  @Column()
  meta: number;

  @Column({
    default: 1,
  })
  amount: number;

  @Column({
    default: true,
  })
  takeable: boolean;
}
