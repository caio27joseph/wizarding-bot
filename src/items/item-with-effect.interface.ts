// Enum definitions

import { groupBy } from 'lodash';
import { AttributeNameValue } from '~/player-system/attribute/entities/attributes.entity';
import { WitchPredilectionNameValue } from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { SpellCategoryNameValue } from '~/spell/entities/spell.entity';

export enum BonusTarget {
  Attribute = 'Attribute',
  WitchPredilection = 'WitchPredilection',
  SpellCategory = 'SpellCategory',
}
export enum BonusType {
  Dice = 'Dice',
  AutoSuccess = 'AutoSuccess',
}

type BonusModifier = 'flat' | 'multiply';

// Mapping from BonusReceiver to valid receiver keys
interface BonusTargetKeyMapping {
  [BonusTarget.Attribute]: AttributeNameValue;
  [BonusTarget.WitchPredilection]: WitchPredilectionNameValue;
  [BonusTarget.SpellCategory]: SpellCategoryNameValue;
}

// Bonus type with generics
export type Bonus<R extends BonusTarget = BonusTarget> = {
  bonusType: BonusType;
  modifier: BonusModifier;
  value: number;
  target: R;
  targetKeys: BonusTargetKeyMapping[R];
};

// apply the bonus to a value
export const applyBonuses = (key: string, value: number, bonus: Bonus[]) => {
  const bonuses = bonus.filter((b) => b.targetKeys.includes(key as any));
  // divide flat and multiply bonuses
  const bonusesByModifier = groupBy(bonuses, (b) => b.modifier);
  let result = value;
  for (const bonus of bonusesByModifier['flat'] || []) {
    result += bonus.value;
  }
  for (const bonus of bonusesByModifier['multiply'] || []) {
    result *= bonus.value;
  }

  return result;
};
