import { Injectable } from '@nestjs/common';
import { Player } from '~/core/player/entities/player.entity';
import { Abilities } from '~/player-system/abilities/entities/abilities.entity';
import { RollsD10 } from './entities/roll.entity';
import { AbilitiesService } from '~/player-system/abilities/abilities.service';
import { AttributeService } from '~/player-system/attribute/attribute.service';
import { CompetencesService } from '~/player-system/competences/competences.service';
import { ExtrasService } from '~/player-system/extras/extras.service';
import { NonConvPredilectionsService } from '~/player-system/nonconv-predilection/noconv-predilections.service';
import { WitchPredilectionsService } from '~/player-system/witch-predilection/witch-predilection.service';

@Injectable()
export class RollService {
  constructor(
    private readonly attributesService: AttributeService,
    private readonly abilitiesService: AbilitiesService,
    private readonly competencesService: CompetencesService,
    private readonly witchPredilectionsService: WitchPredilectionsService,
    private readonly nonConvPredilectionsService: NonConvPredilectionsService,
    private readonly extrasService: ExtrasService,
  ) {}

  async roll10(
    player: Player,
    options?: {
      diff?: number;
      autoSuccess?: number;
      bonus?: number;
      attribute?: string;
      skills?: string;
      talent?: string;
      knowledge?: string;
      competence?: string;
      witchPredilection?: string;
      nonConvPredilectionsChoices?: string;
      extras?: string;
      message?: string;
    },
  ) {
    let values: number[] = [];
    let expression = '';
    let abilities: Abilities;

    // #region Attributes

    if (options?.attribute) {
      const attributes = await this.attributesService.findOne({
        where: {
          playerId: player.id,
        },
      });
      const value = attributes[options?.attribute];
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }

    // #endregion
    // #region Abilities
    if (options?.skills || options?.talent || options?.knowledge) {
      abilities = await this.abilitiesService.findOne({
        where: {
          playerId: player.id,
        },
      });
    }
    if (options?.skills) {
      const value = abilities[options?.skills];
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    if (options?.talent) {
      const value = abilities[options?.talent];
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    if (options?.knowledge) {
      const value = abilities[options?.knowledge];
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
      const value = extras[options?.extras];
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    // #endregion
    // #region Competences
    if (options?.competence) {
      const competences = await this.competencesService.findOne({
        where: {
          playerId: player.id,
        },
      });
      const value = competences[options?.competence];
      values.push(value);
      if (expression.length > 0) expression += ' + ';
      expression += `${value}`;
    }
    // #endregion
    // #region Witch Predilections
    if (options?.witchPredilection) {
      const witchPredilections = await this.witchPredilectionsService.findOne({
        where: {
          playerId: player.id,
        },
      });
      const value = witchPredilections[options?.witchPredilection];
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

    return roll;
  }
}
