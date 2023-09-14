import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { ShopItem } from './shop-item.entity';
import { Space } from '~/spaces/space/entities/space.entity';
import { EmbedBuilder } from 'discord.js';

@Entity()
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  name?: string;

  @ManyToOne(() => Player)
  @JoinColumn()
  onwer: Player;

  @ManyToOne(() => Space, (space) => space.shops)
  @JoinColumn()
  space: Space;

  @Column({
    default: false,
  })
  infinite: boolean;

  @OneToMany(() => ShopItem, (item) => item.shop, {
    cascade: true,
    eager: true,
  })
  items: ShopItem[];

  toEmbed(): EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setTitle(this.name ?? 'Loja');
    const descriptions = this.items.map((item) => {
      let sellMessage = '';
      let buyMessage = '';

      const buyPrice = 'G$' + item.buyPrice.toFixed(2);
      const sellPrice = 'G$' + item.sellPrice.toFixed(2);

      if (item.type === 'buy') {
        buyMessage = `**Comprar**: ${buyPrice}`;
      }
    });
    return embed;
  }
}
