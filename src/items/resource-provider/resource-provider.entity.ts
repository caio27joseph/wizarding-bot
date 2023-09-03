import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from '../item/entities/item.entity';
import { Space } from '~/spaces/space/entities/space.entity';
import { EmbedBuilder } from 'discord.js';
import { addDays, addHours, addMinutes, displayBRT } from '~/utils/date.utils';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  AttributeKeyType,
  attributeKeyToDisplayMap,
} from '~/player-system/attribute/entities/attributes.entity';
import {
  AbilitiesKeys,
  abilitiesKeyToDisplayMap,
} from '~/player-system/abilities/entities/abilities.entity';
import { RollOptions } from '~/roll/roll.service';

export class RollSpec {
  meta?: number;
  attribute?: AttributeKeyType;
  hab1?: AbilitiesKeys;
  hab2?: AbilitiesKeys;
  hab3?: AbilitiesKeys;
  competence?: string;
  witchPredilection?: string;
  nonConvPredilectionsChoices?: string;
  extras?: string;

  spell?: string;
  secret?: boolean;
}

@Entity()
@ObjectType()
export class ResourceProvider {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column({
    nullable: true,
  })
  @Field({
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
  @Field()
  lastTimeOpened: Date;

  @Column()
  @Field()
  daysCooldown: number;

  @Column({
    default: 0,
  })
  @Field()
  hoursCooldown: number;

  @Column({
    default: 0,
  })
  @Field()
  minutesCooldown: number;

  @Column({
    default: 15,
  })
  @Field()
  minutesCooldownPerception: number;

  @Column({
    default: true,
  })
  @Field()
  public: boolean;

  @Column()
  @Field()
  lastTimeSearched: Date;

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
  @Field()
  minDrop: number;
  @Column()
  @Field()
  maxDrop: number;

  @Column()
  @Field()
  metaForAExtraDrop: number;
  @Column()
  @Field()
  metaPerceptionRoll: number;

  @Column({
    type: 'json',
    default: [],
  })
  rolls: RollSpec[];

  @Column()
  @Field()
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
      description += `**Meta para Extra Drop: ** ${this.metaForAExtraDrop}\n`;
      description += `**Meta para Percepção: ** ${this.metaPerceptionRoll}\n`;

      embed.setDescription(description);
      const fields = this.rolls.map((roll, index) => {
        let description = '';
        if (roll.attribute) {
          description += `**Atributo: ** ${
            attributeKeyToDisplayMap[roll.attribute]
          }\n`;
        }
        if (roll.hab1) {
          description += `**Habilidade 1: ** ${
            abilitiesKeyToDisplayMap[roll.hab1]
          }\n`;
        }
        if (roll.hab2) {
          description += `**Habilidade 2: ** ${
            abilitiesKeyToDisplayMap[roll.hab2]
          }\n`;
        }
        if (roll.hab3) {
          description += `**Habilidade 3: ** ${
            abilitiesKeyToDisplayMap[roll.hab3]
          }\n`;
        }
        if (roll.witchPredilection) {
          description += `**Predileção Bruxa: ** ${roll.witchPredilection}\n`;
        }
        if (roll.nonConvPredilectionsChoices) {
          description += `**Predileção Não Convencional: ** ${roll.nonConvPredilectionsChoices}\n`;
        }
        if (roll.extras) {
          description += `**Extras: ** ${roll.extras}\n`;
        }

        if (roll.spell) {
          description += `**Spell: ** ${roll.spell}\n`;
        }
        if (roll.secret) {
          description += `**Secret: ** ${roll.secret}\n`;
        }
        return {
          name: 'Roll ' + (index + 1),
          value: description,
        };
      });
      embed.addFields(fields);
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

  getValidRoll(options: RollOptions) {
    return this.rolls.find((roll) => {
      let valid = true;
      if (options?.attribute) {
        valid = valid && roll.attribute === options?.attribute;
      }
      if (options?.hab1) {
        valid = valid && roll.hab1 === options?.hab1;
      }
      if (options?.hab2) {
        valid = valid && roll.hab2 === options?.hab2;
      }
      if (options?.hab3) {
        valid = valid && roll.hab3 === options?.hab3;
      }
      if (options?.witchPredilection) {
        valid = valid && roll.witchPredilection === options?.witchPredilection;
      }
      if (options?.nonConvPredilectionsChoices) {
        valid =
          valid &&
          roll.nonConvPredilectionsChoices ===
            options?.nonConvPredilectionsChoices;
      }
      if (options?.extras) {
        valid = valid && roll.extras === options?.extras;
      }

      return valid;
    });
  }
}
