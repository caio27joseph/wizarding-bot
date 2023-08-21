import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WandCore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  bonuses: string;
}
