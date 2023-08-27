import { Space } from '~/spaces/space/entities/space.entity';

export interface NewResourceProviderProps {
  daysCooldown: number;
  minAmount: number;
  maxAmount: number;
  metaForMaxAmount: number;
  amountForExtraDrop: number;
}
