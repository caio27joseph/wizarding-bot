import { Injectable } from '@nestjs/common';
import { Player } from '~/core/player/entities/player.entity';
import {
  Abilities,
  AbilitiesKeys,
} from '~/player-system/abilities/entities/abilities.entity';
import { RollsD10 } from './entities/roll.entity';
import { AbilitiesService } from '~/player-system/abilities/abilities.service';
import { AttributeService } from '~/player-system/attribute/attribute.service';
import { ExtrasService } from '~/player-system/extras/extras.service';
import { NonConvPredilectionsService } from '~/player-system/nonconv-predilection/noconv-predilections.service';
import { WitchPredilectionsService } from '~/player-system/witch-predilection/witch-predilection.service';
import { DiscordSimpleError } from '~/discord/exceptions';
import { groupBy } from 'lodash';
import {
  Bonus,
  BonusTarget,
  BonusType,
  applyBonuses,
} from '~/items/bonuses/item-with-bonus.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandInteraction } from 'discord.js';
import { AttributeKeyType } from '~/player-system/attribute/entities/attributes.entity';
import {
  WitchPredilectionKeyEnum,
  WitchPredilectionKeys,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';

export class RollOptions {
  identifier?: string;
  diff?: number;
  autoSuccess?: number;
  bonus?: number;
  meta?: number;
  attribute?: AttributeKeyType;
  hab1?: AbilitiesKeys;
  hab2?: AbilitiesKeys;
  hab3?: AbilitiesKeys;
  magicSchool?: WitchPredilectionKeys;
  nonConvPredilectionsChoices?: string;
  extras?: string;
  message?: string;
  bonuses?: Bonus[];
}

export interface RollEvent {
  roll: RollsD10;
  player: Player;
  options: RollOptions;
  interaction: CommandInteraction;
}

@Injectable()
export class RollService {
  constructor(
    private readonly attributesService: AttributeService,
    private readonly abilitiesService: AbilitiesService,
    private readonly witchPredilectionsService: WitchPredilectionsService,
    private readonly nonConvPredilectionsService: NonConvPredilectionsService,
    private readonly extrasService: ExtrasService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async roll10(
    interaction: CommandInteraction,
    player: Player,
    options?: RollOptions,
  ) {
    let values: number[] = [];
    let expression = '';
    let abilities: Abilities;
    const bonuses = [] as Bonus<BonusTarget.Attribute>[];
    const bonusByType = groupBy(bonuses, (b) => b.bonusType);
    const bonusesByTarget = groupBy(
      bonusByType[BonusType.Dice],
      (b) => b.target,
    );
    // #region Attributes

    if (options?.attribute) {
      const attributes = await this.attributesService.findOne({
        where: {
          playerId: player.id,
        },
      });
      if (!attributes) {
        throw new DiscordSimpleError(
          'Você deve configurar os atributos usando o comando /atb atualizar',
        );
      }
      let value = attributes[options?.attribute];
      value = applyBonuses(
        options?.attribute,
        value,
        bonusesByTarget[BonusTarget.Attribute] || [],
      );
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }

    if (options?.hab1 || options?.hab2 || options?.hab1) {
      abilities = await this.abilitiesService.findOne({
        where: {
          playerId: player.id,
        },
      });
      if (!abilities) {
        throw new DiscordSimpleError(
          'Você deve configurar suas habilidades usando os comandos' +
            ' [/pericias atualizar; /talentos atualizar; /conhecimentos atualizar]',
        );
      }
    }
    if (options?.hab1) {
      const value = abilities[options?.hab1];

      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    if (options?.hab2) {
      const value = abilities[options?.hab2];
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    if (options?.hab3) {
      const value = abilities[options?.hab3];
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    // #endregion
    // #region Extras
    if (options?.extras) {
      const extras = await this.extrasService.findOne({
        where: {
          playerId: player.id,
        },
      });
      if (!extras) {
        throw new DiscordSimpleError(
          'Você deve configurar suas informações extras usando o comando' +
            ' [/extras atualizar]',
        );
      }
      const value = extras[options?.extras];
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    // #endregion
    // #region Witch Predilections
    if (options?.magicSchool) {
      const magicSchool = await this.witchPredilectionsService.findOne({
        where: {
          playerId: player.id,
        },
      });

      if (!magicSchool) {
        throw new DiscordSimpleError(
          'Você deve configurar suas Predileções Bruxas usando o comando' +
            ' [/pred_bruxa atualizar]',
        );
      }
      const value = magicSchool[options?.magicSchool];
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    // #endregion
    // #region Non Conv Predilections
    if (options?.nonConvPredilectionsChoices) {
      const nonConvPredilections =
        await this.nonConvPredilectionsService.findOne({
          where: {
            playerId: player.id,
          },
        });
      if (!nonConvPredilections) {
        throw new DiscordSimpleError(
          'Você deve configurar suas Predileções Não Convencionais usando o comando' +
            ' [/ncpred atualizar]',
        );
      }
      const value = nonConvPredilections[options?.nonConvPredilectionsChoices];
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    // #endregion
    // #region Bonus
    if (options?.bonus) {
      values.push(options?.bonus);
      if (expression.length > 0) expression += ' + ';
      expression += `${options?.bonus}`;
    }
    // #endregion
    const roll = new RollsD10(
      values,
      options?.diff || 6,
      options?.autoSuccess || 0,
      options?.message,
    );

    this.eventEmitter.emit('roll', {
      roll,
      player,
      options,
      interaction,
    });

    return roll;
  }
}
