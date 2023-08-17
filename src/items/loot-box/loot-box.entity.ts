import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LootBox {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
