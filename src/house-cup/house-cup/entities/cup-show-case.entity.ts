import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { HouseCup } from './house-cup.entity';

@ObjectType()
export class HousePodium {
  @Field()
  position: number;
  @Field()
  houseId: string;
  @Field()
  total: number;
}
@ObjectType()
@Entity()
export class CupShowCase {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  @Column({
    nullable: true,
  })
  @Field({
    nullable: true,
  })
  message?: string;

  @OneToOne(() => HouseCup, (cup) => cup.showCase, {
    cascade: true,
  })
  cup: HouseCup;

  @Column()
  @Field()
  cupId: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  @Field((type) => [HousePodium], {
    nullable: true,
  })
  podiums?: HousePodium[];

  @Column()
  @Field()
  channelId: string;

  @Column({
    nullable: true,
  })
  @Field({
    nullable: true,
  })
  lastMessageId: string;
}
