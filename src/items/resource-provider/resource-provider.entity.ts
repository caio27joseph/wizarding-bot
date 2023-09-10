import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from '../item/entities/item.entity';
import { Space } from '~/spaces/space/entities/space.entity';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
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
import { RollEvent, RollOptions } from '~/roll/roll.service';
import { waitForEvent } from '~/utils/wait-for-event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Player } from '~/core/player/entities/player.entity';
import { ItemPool } from '../item-pool/entitites/item-pool.entity';
import { magicSchoolKeyToDisplayMap } from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { nonConvKeyToDisplayMap } from '~/player-system/nonconv-predilection/entities/nonconv-predilections.entity';
import { extrasKeyToDisplayMap } from '~/player-system/extras/entities/extras.entity';

export enum ProviderActionType {
  FISH = 'fish',
  COLLECT = 'collect',
}

export const ProviderActionTypePortuguese = {
  [ProviderActionType.FISH]: 'Pescar',
  [ProviderActionType.COLLECT]: 'Coletar',
};

export class RollSpec {
  meta?: number;
  attribute?: AttributeKeyType;
  hab1?: AbilitiesKeys;
  hab2?: AbilitiesKeys;
  hab3?: AbilitiesKeys;
  competence?: string;
  magicSchool?: string;
  nonConvPredilectionsChoices?: string;
  extras?: string;
  identifier: string;
  display?: string;
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

  @Column({
    type: 'enum',
    enum: ProviderActionType,
    default: ProviderActionType.COLLECT,
  })
  actionType?: ProviderActionType;

  @ManyToOne(() => Item, (item) => item.resourceProviders, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  item?: Item;

  @ManyToOne(() => ItemPool, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  pool?: ItemPool;

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
      if (this.item) {
        description += `**Item: **${this.item.name}\n`;
      }
      if (this.pool) {
        description += `**Pool: **${this.pool.name}\n`;
      }
      description += `**Ação: **${
        ProviderActionTypePortuguese[this.actionType]
      }\n`;
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
        if (roll.magicSchool) {
          description += `**Escola Mágica: ** ${roll.magicSchool}\n`;
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
        if (roll.identifier) {
          description += `**Identifier: ** ${roll.identifier}\n`;
        }
        description += `**Meta: ** ${roll.meta || 3}\n`;
        return {
          name: roll.display ? roll.display : 'Roll ' + (index + 1),
          value: description,
        };
      });
      embed.addFields(fields);
    } else {
      embed.setDescription(this.description);
    }
    if (this.imageUrl) {
      embed.setThumbnail(this.imageUrl);
    }
    return embed;
  }

  private getValidRoll(options: RollOptions) {
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
      if (options?.magicSchool) {
        valid = valid && roll.magicSchool === options?.magicSchool;
      }
      if (options?.identifier) {
        valid = valid && roll.identifier === options?.identifier;
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
  async open({
    eventEmitter,
    player,
    interaction,
  }: {
    eventEmitter: EventEmitter2;
    player: Player;
    interaction: CommandInteraction;
  }) {
    let metaForMaxDrop: number;
    const { roll }: RollEvent = await waitForEvent(
      eventEmitter,
      'roll',
      (data: RollEvent) => {
        const samePlayer = data.player.id === player.id;
        const sameChannel =
          data.interaction.channelId === interaction.channelId;

        const validRoll = this.getValidRoll(data.options);
        metaForMaxDrop = validRoll.meta || 3;
        return samePlayer && sameChannel && !!validRoll;
      },
    );

    const { maxDrop, minDrop, metaForAExtraDrop } = this;
    const extraMeta = roll.total - metaForMaxDrop;

    const dropPerMeta = (maxDrop - minDrop) / metaForMaxDrop;

    let drops = Math.floor(roll.total * dropPerMeta) + minDrop;
    drops = Math.min(drops, maxDrop);

    if (extraMeta >= metaForAExtraDrop && metaForAExtraDrop !== 0) {
      drops += Math.floor(extraMeta / metaForAExtraDrop);
    }
    let item: Item;
    if (this.pool) {
      item = await this.pool.drawItem();
    } else {
      item = this.item;
    }

    return { drops, item };
  }

  availableRollsMessage() {
    const possibleRolls = this.rolls
      .filter((roll) => !roll.secret)
      .map((roll) => {
        let description = `${roll.display ? roll.display : ''} - /dr `;
        if (roll.attribute) {
          description += `**atributo:**${
            attributeKeyToDisplayMap[roll.attribute]
          } `;
        }
        if (roll.hab1) {
          description += `**hab1:**${abilitiesKeyToDisplayMap[roll.hab1]} `;
        }
        if (roll.hab2) {
          description += `**hab2:**${abilitiesKeyToDisplayMap[roll.hab2]} `;
        }
        if (roll.hab3) {
          description += `**hab3:**${abilitiesKeyToDisplayMap[roll.hab3]} `;
        }
        if (roll.magicSchool) {
          description += `**escola_magica:**${
            magicSchoolKeyToDisplayMap[roll.magicSchool]
          } `;
        }
        if (roll.nonConvPredilectionsChoices) {
          description += `**predilecao_nao_convencional:**${
            nonConvKeyToDisplayMap[roll.nonConvPredilectionsChoices]
          } `;
        }
        if (roll.extras) {
          description += `**extras:**${extrasKeyToDisplayMap[roll.extras]} `;
        }
        return description;
      });

    return possibleRolls;
  }
}
