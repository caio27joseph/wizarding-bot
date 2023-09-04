// Enum definitions

import { EmbedField } from 'discord.js';
import { groupBy } from 'lodash';
import {
  AttributeKeyType,
  attributeChoices,
  attributeKeyToDisplayMap,
} from '~/player-system/attribute/entities/attributes.entity';
import {
  MagicSchoolDisplays,
  magicSchoolKeyToDisplayMap,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';

export enum BonusTarget {
  Attribute = 'Atributos',
  AllMagicSchools = 'Escola Mágica (Todos)',
  MagicSchool = 'Escola Mágica (Escolher Categoria)',
  SpellCategory = 'Feitiços (Escolher Categoria)',
  AllSpells = 'Feitiços (Todos)',
}

export enum BonusType {
  Dice = 'Dice',
  AutoSuccess = 'AutoSuccess',
}
export enum BonusModifier {
  Flat = 'flat',
  Multiply = 'multiply',
}

// Mapping from BonusReceiver to valid receiver keys
export type BonusTargetMapping = {
  [BonusTarget.Attribute]: AttributeKeyType;
  [BonusTarget.MagicSchool]: MagicSchoolDisplays;
  [BonusTarget.SpellCategory]: MagicSchoolDisplays;
  [BonusTarget.AllSpells]: null;
  [BonusTarget.AllMagicSchools]: null;
};

// Bonus type with generics
export type Bonus<R extends BonusTarget = BonusTarget> = {
  id?: string;
  bonusType: BonusType;
  modifier: BonusModifier;
  amount: number;
  target: R;
  targetKey: BonusTargetMapping[R];
};
export class BonusHelper {
  constructor(private readonly bonus?: Bonus) {}

  static fieldNameMap = {
    [BonusTarget.SpellCategory]: 'Feitiços',
    [BonusTarget.MagicSchool]: 'Escola Mágicas',
    [BonusTarget.Attribute]: 'Atributos',
    [BonusTarget.AllMagicSchools]: 'Escola Mágicas',
    [BonusTarget.AllSpells]: 'Feitiços',
  };
  static bonusTypeNameMap = {
    [BonusType.Dice]: 'Dado(s)',
    [BonusType.AutoSuccess]: 'Sucesso(s) Automático(s)',
  };

  get displayBonusType() {
    return BonusHelper.bonusTypeNameMap[this.bonus.bonusType];
  }

  get choices() {
    switch (this.bonus.target) {
      case BonusTarget.SpellCategory:
        return magicSchoolKeyToDisplayMap;
      case BonusTarget.MagicSchool:
        return magicSchoolKeyToDisplayMap;
      case BonusTarget.Attribute:
        return attributeChoices;
    }
    return [];
  }

  get displayKey() {
    switch (this.bonus.target) {
      case BonusTarget.SpellCategory:
        return magicSchoolKeyToDisplayMap[this.bonus.targetKey];
      case BonusTarget.MagicSchool:
        return magicSchoolKeyToDisplayMap[this.bonus.targetKey];
      case BonusTarget.Attribute:
        return attributeKeyToDisplayMap[this.bonus.targetKey];
      case BonusTarget.AllSpells:
        return 'Todos os Feitiços';
      case BonusTarget.AllMagicSchools:
        return 'Todas as Escolas Mágicas';
    }
    return 'Não Especificado';
  }

  toLineDisplay() {
    return `[${BonusHelper.fieldNameMap[this.bonus.target]}]: ${
      this.bonus.amount
    } ${this.displayBonusType} em ${this.displayKey}`;
  }

  toEmbedField() {
    let value: string = `${this.bonus.amount} ${this.displayBonusType} em ${this.displayKey}`;

    const field: EmbedField = {
      name: BonusHelper.fieldNameMap[this.bonus.target],
      value,
      inline: false,
    };
    return field;
  }
}

// apply the bonus to a value
export const applyBonuses = (key: string, value: number, bonus: Bonus[]) => {
  const bonuses = bonus.filter((b) => b.targetKey.includes(key as any));
  // divide flat and multiply bonuses
  const bonusesByModifier = groupBy(bonuses, (b) => b.modifier);
  let result = value;
  for (const bonus of bonusesByModifier['flat'] || []) {
    result += bonus.amount;
  }
  for (const bonus of bonusesByModifier['multiply'] || []) {
    result *= bonus.amount;
  }

  return result;
};

export interface CanHaveBonus {
  bonuses: Bonus[];
}
