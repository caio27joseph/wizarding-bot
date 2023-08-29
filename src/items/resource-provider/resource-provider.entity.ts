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
  lastTimeOpened: Date;

  @Column()
  lastTimeSearched: Date;

  @Column()
  daysCooldown: number;

  @Column()
  minDrop: number;
  @Column()
  maxDrop: number;

  @Column()
  metaForMaxDrop: number;
  @Column()
  metaForAExtraDrop: number;
  @Column()
  metaPerceptionRoll: number;

  @Column()
  rollType1: string;
  @Column()
  rollType2: string;
  @Column({
    nullable: true,
  })
  rollType3?: string;

  @Column()
  roll1: string;
  @Column()
  roll2: string;
  @Column({
    nullable: true,
  })
  roll3?: string;

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
