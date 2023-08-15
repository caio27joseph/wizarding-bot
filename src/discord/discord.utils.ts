import { Choice } from './types';

export const enumToChoice = <Enum>(ability: keyof Enum, e: Enum): Choice => {
  return {
    name: e[ability as keyof Enum] as unknown as string,
    value: ability.toString().toLowerCase(),
  };
};

export function normalizedName(inputStr) {
  // Normalize the string to remove diacritics
  let normalized = inputStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Convert to lowercase and replace spaces with underscores
  return normalized.toLowerCase().replace(/\s+/g, '_').toLowerCase();
}
