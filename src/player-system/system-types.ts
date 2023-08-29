import { getDisplayKeyMaps } from '~/utils/entity-types';
import {
  SkillDisplayEnum,
  TalentDisplayEnum,
  KnowledgeDisplayEnum,
  skillDisplayToKeyMap,
  talentDisplayToKeyMap,
  knowledgeDisplayToKeyMap,
  knowledgeKeyToDisplayMap,
  skillKeyToDisplayMap,
  talentKeyToDisplayMap,
} from './abilities/entities/abilities.entity';
import {
  AttributeDisplayEnum,
  attributeDisplayToKeyMap,
  attributeKeyToDisplayMap,
} from './attribute/entities/attributes.entity';
import {
  CompetenceDisplayEnum,
  competenceDisplayToKeyMap,
  competenceKeyToDisplayMap,
} from './competences/entities/competences.entity';
import {
  WitchPredilectionDisplayEnum,
  witchPredilectionDisplayToKeyMap,
  witchPredilectionKeyToDisplayMap,
} from './witch-predilection/entities/witch-predilection.entity';

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
  Skill = 'skill',
  Talent = 'talent',
  Knowledge = 'knowledge',
  Competence = 'competence',
  WitchPredilection = 'witch_predilection',
}

export const {
  displayToKeyMap: pointsDisplayToKeyMap,
  keyToDisplayMap: pointsKeyToDisplayMap,
} = getDisplayKeyMaps(PointsDisplayEnum, PointsKeyEnum);

export const pointsKeyToEnums = {
  [PointsKeyEnum.Attribute]: AttributeDisplayEnum,
  [PointsKeyEnum.Skill]: SkillDisplayEnum,
  [PointsKeyEnum.Talent]: TalentDisplayEnum,
  [PointsKeyEnum.Knowledge]: KnowledgeDisplayEnum,
  [PointsKeyEnum.Competence]: CompetenceDisplayEnum,
  [PointsKeyEnum.WitchPredilection]: WitchPredilectionDisplayEnum,
};
export const pointsKeyToTargetDisplayMap = {
  [PointsKeyEnum.Attribute]: attributeDisplayToKeyMap,
  [PointsKeyEnum.Skill]: skillDisplayToKeyMap,
  [PointsKeyEnum.Talent]: talentDisplayToKeyMap,
  [PointsKeyEnum.Knowledge]: knowledgeDisplayToKeyMap,
  [PointsKeyEnum.Competence]: competenceDisplayToKeyMap,
  [PointsKeyEnum.WitchPredilection]: witchPredilectionDisplayToKeyMap,
};
export const pointsKeyToTargetKeyMap = {
  [PointsKeyEnum.Attribute]: attributeKeyToDisplayMap,
  [PointsKeyEnum.Skill]: skillKeyToDisplayMap,
  [PointsKeyEnum.Talent]: talentKeyToDisplayMap,
  [PointsKeyEnum.Knowledge]: knowledgeKeyToDisplayMap,
  [PointsKeyEnum.Competence]: competenceKeyToDisplayMap,
  [PointsKeyEnum.WitchPredilection]: witchPredilectionKeyToDisplayMap,
};

export type AvailablePointsEnums =
  | AttributeDisplayEnum
  | SkillDisplayEnum
  | TalentDisplayEnum
  | KnowledgeDisplayEnum
  | CompetenceDisplayEnum
  | WitchPredilectionDisplayEnum;
