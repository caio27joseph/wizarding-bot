import { getDisplayKeyMaps } from '~/utils/entity-types';

import {
  AttributeDisplayEnum,
  attributeDisplayToKeyMap,
  attributeKeyToDisplayMap,
} from './attribute/entities/attributes.entity';

import {
  MagicSchoolDisplayEnum,
  magicSchoolDisplayToKeyMap,
  magicSchoolKeyToDisplayMap,
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
  MagicSchool = 'Escola Mágica',
}

export enum PointsKeyEnum {
  Attribute = 'attribute',
  Ability = 'ability',
  MagicSchool = 'witch_predilection',
}

export const {
  displayToKeyMap: pointsDisplayToKeyMap,
  keyToDisplayMap: pointsKeyToDisplayMap,
} = getDisplayKeyMaps(PointsDisplayEnum, PointsKeyEnum);

export const pointsKeyToEnums = {
  [PointsKeyEnum.Attribute]: AttributeDisplayEnum,
  [PointsKeyEnum.Ability]: AbilitiesDisplayEnum,
  [PointsKeyEnum.MagicSchool]: MagicSchoolDisplayEnum,
};
export const pointsKeyToTargetDisplayMap = {
  [PointsKeyEnum.Attribute]: attributeDisplayToKeyMap,
  [PointsKeyEnum.Ability]: abilitiesDisplayToKeyMap,
  [PointsKeyEnum.MagicSchool]: magicSchoolDisplayToKeyMap,
};
export const pointsKeyToTargetKeyMap = {
  [PointsKeyEnum.Attribute]: attributeKeyToDisplayMap,
  [PointsKeyEnum.Ability]: abilitiesKeyToDisplayMap,
  [PointsKeyEnum.MagicSchool]: magicSchoolKeyToDisplayMap,
};

export type AvailablePointsEnums =
  | AttributeDisplayEnum
  | AbilitiesDisplayEnum
  | MagicSchoolDisplayEnum;
