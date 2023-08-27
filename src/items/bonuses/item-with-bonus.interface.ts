// Enum definitions

import { EmbedField } from 'discord.js';
import { groupBy } from 'lodash';
import {
  AttributeNameValue,
  attributeChoices,
  attributeDisplay,
} from '~/player-system/attribute/entities/attributes.entity';
import {
  WitchPredilectionNameValue,
  witchPredilectionChoices,
  witchPredilectionDisplay,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';

export enum BonusTarget {
  Attribute = 'Atributos',
  AllWitchPredilection = 'Escola Mágica (Todos)',
  WitchPredilection = 'Escola Mágica (Escolher Categoria)',
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
  [BonusTarget.Attribute]: AttributeNameValue;
  [BonusTarget.WitchPredilection]: WitchPredilectionNameValue;
  [BonusTarget.SpellCategory]: WitchPredilectionNameValue;
  [BonusTarget.AllSpells]: null;
  [BonusTarget.AllWitchPredilection]: null;
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
    [BonusTarget.WitchPredilection]: 'Escola Mágicas',
    [BonusTarget.Attribute]: 'Atributos',
    [BonusTarget.AllWitchPredilection]: 'Escola Mágicas',
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
        return witchPredilectionChoices;
      case BonusTarget.WitchPredilection:
        return witchPredilectionChoices;
      case BonusTarget.Attribute:
        return attributeChoices;
    }
    return [];
  }

  get displayKey() {
    switch (this.bonus.target) {
      case BonusTarget.SpellCategory:
        return witchPredilectionDisplay[this.bonus.targetKey];
      case BonusTarget.WitchPredilection:
        return witchPredilectionDisplay[this.bonus.targetKey];
      case BonusTarget.Attribute:
        return attributeDisplay[this.bonus.targetKey];
      case BonusTarget.AllSpells:
        return 'Todos os Feitiços';
      case BonusTarget.AllWitchPredilection:
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
