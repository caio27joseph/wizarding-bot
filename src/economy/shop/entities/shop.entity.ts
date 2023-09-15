import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { ShopItem, ShopType } from './shop-item.entity';
import { Space } from '~/spaces/space/entities/space.entity';
import { EmbedBuilder, EmbedField } from 'discord.js';

@Entity()
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  name?: string;

  @Column({
    default: false,
  })
  infinite: boolean;

  @Column({
    default: 0,
    type: 'float',
  })
  wizardMoney: number;

  @ManyToOne(() => Player)
  @JoinColumn()
  onwer: Player;

  @ManyToOne(() => Space, (space) => space.shops)
  @JoinColumn()
  space: Space;

  @OneToMany(() => ShopItem, (item) => item.shop, {
    cascade: true,
    eager: true,
  })
  items: ShopItem[];

  toEmbed(): EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setTitle(this.name ?? 'Loja');
    let sellMessage = '';
    let buyMessage = '';
    this.items = this.items || [];
    this.items.forEach((si) => {
      const buyPrice = 'G$ ' + si.buyPrice.toFixed(2);
      const sellPrice = 'G$ ' + si.sellPrice.toFixed(2);
      const qtd = Math.abs(si.quantity);
      if (si.type === ShopType.BOTH) {
        buyMessage += `\n**${si.item.name}**: ${buyPrice}`;
        sellMessage += `\n**${si.item.name}**: ${sellPrice}`;
      }
      if (si.type === ShopType.SELL) {
        sellMessage += `\n**${si.item.name}**: ${sellPrice}`;
      }
      if (si.type === ShopType.BUY) {
        buyMessage += `\n**${si.item.name}**: ${buyPrice}`;
      }
    });
    const fields: EmbedField[] = [];
    if (buyMessage)
      fields.push({ name: 'Comprar', value: buyMessage, inline: true });
    if (sellMessage)
      fields.push({ name: 'Vender', value: sellMessage, inline: true });
    embed.addFields(fields);
    return embed;
  }
}
