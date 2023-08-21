import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
