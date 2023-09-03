import { getDisplayKeyMaps } from '~/utils/entity-types';

import {
  AttributeDisplayEnum,
  attributeDisplayToKeyMap,
  attributeKeyToDisplayMap,
} from './attribute/entities/attributes.entity';

import {
  WitchPredilectionDisplayEnum,
  witchPredilectionDisplayToKeyMap,
  witchPredilectionKeyToDisplayMap,
} from './witch-predilection/entities/witch-predilection.entity';
import {
  AbilitiesDisplayEnum,
  abilitiesDisplayToKeyMap,
  abilitiesKeyToDisplayMap,
} from './abilities/entities/abilities.entity';

export enum PointsDisplayEnum {
  Attribute = 'Atributo',
  Skill = 'Perícia',
  Talent = 'Talento',
  Knowledge = 'Conhecimento',
  Competence = 'Competência',
  WitchPredilection = 'Escola Mágica',
}

export enum PointsKeyEnum {
  Attribute = 'attribute',
  Ability = 'ability',
  Competence = 'competence',
  WitchPredilection = 'witch_predilection',
}

export const {
  displayToKeyMap: pointsDisplayToKeyMap,
  keyToDisplayMap: pointsKeyToDisplayMap,
} = getDisplayKeyMaps(PointsDisplayEnum, PointsKeyEnum);

export const pointsKeyToEnums = {
  [PointsKeyEnum.Attribute]: AttributeDisplayEnum,
  [PointsKeyEnum.Ability]: AbilitiesDisplayEnum,
  [PointsKeyEnum.WitchPredilection]: WitchPredilectionDisplayEnum,
};
export const pointsKeyToTargetDisplayMap = {
  [PointsKeyEnum.Attribute]: attributeDisplayToKeyMap,
  [PointsKeyEnum.Ability]: abilitiesDisplayToKeyMap,
  [PointsKeyEnum.WitchPredilection]: witchPredilectionDisplayToKeyMap,
};
export const pointsKeyToTargetKeyMap = {
  [PointsKeyEnum.Attribute]: attributeKeyToDisplayMap,
  [PointsKeyEnum.Ability]: abilitiesKeyToDisplayMap,
  [PointsKeyEnum.WitchPredilection]: witchPredilectionKeyToDisplayMap,
};

export type AvailablePointsEnums =
  | AttributeDisplayEnum
  | AbilitiesDisplayEnum
  | WitchPredilectionDisplayEnum;
