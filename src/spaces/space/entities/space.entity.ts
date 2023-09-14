import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { Shop } from '~/economy/shop/entities/shop.entity';
import { ItemDrop } from '~/items/item/entities/item-drop.entity';
import { ResourceProvider } from '~/items/resource-provider/entities/resource-provider.entity';

@Entity()
export class Space {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  channelId: string;

  @ManyToOne(() => Guild)
  @JoinColumn()
  guild: Guild;

  @Column()
  guildId: string;

  @OneToMany(
    () => ResourceProvider,
    (resourceProvider) => resourceProvider.space,
  )
  resourceProviders: Promise<ResourceProvider[]>;

  @OneToMany(() => ItemDrop, (itemDrop) => itemDrop.space)
  itemDrops: Promise<ItemDrop[]>;

  @OneToMany(() => Shop, (shop) => shop.space)
  shops: Promise<Shop[]>;
}
