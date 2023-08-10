import { Choice } from './types';

export const enumToChoice = <Enum>(ability: keyof Enum, e: Enum): Choice => {
  return {
    name: e[ability as keyof Enum] as unknown as string,
    value: ability.toString().toLowerCase(),
  };
};
