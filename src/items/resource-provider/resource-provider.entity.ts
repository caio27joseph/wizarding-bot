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
import { addDays, addHours, addMinutes, displayBRT } from '~/utils/date.utils';

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

  toEmbed(mod?: boolean) {
    const embed = new EmbedBuilder().setTitle(this.name).setFooter({
      text: this.id,
    });
    if (mod) {
      let description = '';
      description += `**Item: **${this.item.name}\n`;
      description += `**Ultima Vez Aberto: ** ${
        this.lastTimeOpened ? displayBRT(this.lastTimeOpened) : 'Nunca'
      }\n`;
      description += `**Ultima Vez Procurado: ** ${
        this.lastTimeSearched ? displayBRT(this.lastTimeSearched) : 'Nunca'
      }\n`;
      description += `**Pode Abrir: ** ${this.canOpen() ? 'Sim' : 'Não'}\n`;
      description += `**Pode Procurar: ** ${
        this.canSearch() ? 'Sim' : 'Não'
      }\n`;
      description += `**Cooldown: ** ${this.daysCooldown} dias ${
        this.hoursCooldown ? this.hoursCooldown + ' horas' : ''
      } ${this.minutesCooldown ? this.minutesCooldown + ' minutos' : ''}\n`;
      description += `**Cooldown Percepção: ** ${this.minutesCooldownPerception} minutos\n`;
      description += `**Minimo de Drop: ** ${this.minDrop}\n`;
      description += `**Maximo de Drop: ** ${this.maxDrop}\n`;
      description += `**Meta para Maximo de Drop: ** ${this.metaForMaxDrop}\n`;
      description += `**Meta para Extra Drop: ** ${this.metaForAExtraDrop}\n`;
      description += `**Meta para Percepção: ** ${this.metaPerceptionRoll}\n`;
      description += `**Tipo de Roll 1: ** ${this.rollType1}\n`;
      description += `**Tipo de Roll 2: ** ${this.rollType2}\n`;
      description += `**Tipo de Roll 3: ** ${this.rollType3}\n`;
      description += `**Roll 1: ** ${this.roll1}\n`;
      description += `**Roll 2: ** ${this.roll2}\n`;
      description += `**Roll 3: ** ${this.roll3}\n`;

      embed.setDescription(description);
    } else {
      embed.setDescription(this.description);
    }
    if (this.imageUrl) {
      embed.setThumbnail(this.imageUrl);
    } else {
      embed.setThumbnail(this.item.imageUrl);
    }
    return embed;
  }
}
