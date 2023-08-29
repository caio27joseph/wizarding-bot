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
import { addDays, addHours, addMinutes } from '~/utils/date.utils';

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
  daysCooldown: number;

  @Column({
    default: 0,
  })
  hoursCooldown: number;
  @Column({
    default: 0,
  })
  minutesCooldown: number;

  @Column({
    default: 15,
  })
  minutesCooldownPerception: number;

  canOpen() {
    const lastTimeOpened = this.lastTimeOpened;
    const nextTime = addDays(lastTimeOpened, this.daysCooldown);
    const nextTimeWithHours = addHours(nextTime, this.hoursCooldown);
    const nextTimeWithMinutes = addMinutes(
      nextTimeWithHours,
      this.minutesCooldown,
    );
    const now = new Date();
    return now > nextTimeWithMinutes;
  }

  @Column()
  lastTimeSearched: Date;

  canSearch() {
    // can searc if not searched in last 30 minutes
    const lastTimeSearched = this.lastTimeSearched;
    const nextTime = addMinutes(
      lastTimeSearched,
      this.minutesCooldownPerception,
    );
    const now = new Date();
    return now > nextTime;
  }

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
      .setTitle(this.name)
      .setDescription(this.description)
      .setFooter({
        text: 'Aqui é possível conseguir: ' + this.item.name,
      });

    if (this.imageUrl) {
      embed.setThumbnail(this.imageUrl);
    } else {
      embed.setThumbnail(this.item.imageUrl);
    }
    return embed;
  }
}
