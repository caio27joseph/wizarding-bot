import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { Item } from '~/items/item/entities/item.entity';

@Entity()
export class PlayerSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Player)
  @JoinColumn()
  player: Player;

  @OneToOne(() => Item)
  @JoinColumn()
  wand: Item;

  // leftHand: string;

  // rightHand: string;

  // head: string;

  // body: string;

  // legs: string;

  // feet: string;

  // neck: string;

  // ring: string;

  // ammo: string;
}
