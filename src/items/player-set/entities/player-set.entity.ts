import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PlayerSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  leftHand: string;

  rightHand: string;

  head: string;

  body: string;

  legs: string;

  feet: string;

  neck: string;

  ring: string;

  ammo: string;
}
