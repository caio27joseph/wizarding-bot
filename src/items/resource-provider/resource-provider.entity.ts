import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from '../item/entities/item.entity';
import { Space } from '~/spaces/space/entities/space.entity';
import { EmbedBuilder } from 'discord.js';

@Entity()
export class ResourceProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    nullable: true,
  })
  imageUrl?: string;

  @Column()
  lastTimeOpened: Date;

  @Column()
  daysCooldown: number;

  @ManyToOne(() => Item, (item) => item.resourceProviders, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  item: Item;

  @ManyToOne(() => Space, (space) => space.resourceProviders)
  @JoinColumn()
  space: Space;

  @Column()
  minAmount: number;
  @Column()
  maxAmount: number;
  @Column()
  metaForMaxAmount: number;
  @Column()
  amountForExtraDrop: number;

  @Column()
  spaceId: string;

  toEmbed() {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: this.name,
      })
      .setDescription(this.description)
      .setAuthor({
        name: 'Gerador de ' + this.item.name,
      });

    if (this.imageUrl) {
      embed.setThumbnail(this.imageUrl);
    } else {
      embed.setThumbnail(this.item.imageUrl);
    }
    return embed;
  }
}
