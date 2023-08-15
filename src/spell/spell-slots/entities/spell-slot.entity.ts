import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { Spell } from '~/spell/entities/spell.entity';

@Entity()
export class SpellSlot {
  @PrimaryGeneratedColumn(`uuid`)
  id: string;

  @ManyToOne(() => Player)
  player: Player;

  @Column()
  playerId: string;

  @ManyToOne(() => Spell, {
    nullable: true,
  })
  spell: Spell;

  @Column({
    nullable: true,
  })
  spellId: string;

  @Column()
  position: number;
}
