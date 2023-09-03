import { Choice } from './types';

export const enumToChoice = <Enum>(ability: keyof Enum, e: Enum): Choice => {
  return {
    name: e[ability as keyof Enum] as unknown as string,
    value: ability.toString().toLowerCase(),
  };
};

export function normalizedName(inputStr: string): string {
  // Normalize the string to remove diacritics
  const normalized = inputStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Convert to lowercase, replace spaces and slashes with underscores, and remove certain characters
  return normalized
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[.-]/g, '')
    .replace(/\//g, '_');
}
