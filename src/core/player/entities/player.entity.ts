import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EmbedBuilder, Interaction, MessagePayload } from 'discord.js';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { House } from '~/core/house/entities/house.entity';
import { DiscordEntityVieable } from '~/discord/types';
import { PointLog } from '~/house-cup/point-logs/entities/point-log.entity';
import { Inventory } from '~/items/inventory/entities/inventory.entity';
import { Abilities } from '~/player-system/abilities/entities/abilities.entity';
import { Attributes } from '~/player-system/attribute/entities/attributes.entity';
import { Extras } from '~/player-system/extras/entities/extras.entity';
import { NonConvPredilections } from '~/player-system/nonconv-predilection/entities/nonconv-predilections.entity';
import { MagicSchool } from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { Train } from '~/evolution/train/entities/train.entity';

@ObjectType()
@Entity()
export class Player implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  name?: string;

  @Column({
    default: 0,
  })
  xp: number;

  @Column({
    default: 0,
  })
  wizardMoney: number;

  @Column({
    default: 0,
  })
  muggleMoney: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  avatarUrl?: string;

  @Index()
  @Column()
  @Field()
  discordId: string;

  @ManyToOne((type) => Guild, (guild) => guild.players)
  guild?: Guild;

  @Column()
  @Field(() => ID)
  guildId: string;

  @ManyToOne((type) => House, (house) => house.players, {
    nullable: true,
    eager: true,
  })
  @Field((type) => House)
  house?: House;

  @Column({
    nullable: true,
  })
  @Field(() => ID, { nullable: true })
  houseId?: string;

  @OneToMany((type) => PointLog, (log) => log.player, {
    cascade: true,
  })
  @Field((type) => [PointLog])
  pointLogs?: PointLog[];

  @OneToOne((type) => Attributes, (attribute) => attribute.player, {
    nullable: true,
  })
  attributes?: Attributes;

  @OneToOne((type) => Abilities, (abilities) => abilities.player, {
    nullable: true,
    cascade: true,
  })
  abilities: Abilities;

  @OneToOne((type) => MagicSchool, (magicSchool) => magicSchool.player, {
    nullable: true,
  })
  magicSchool: MagicSchool;

  @OneToOne(
    (type) => NonConvPredilections,
    (nonConvPredilections) => nonConvPredilections.player,
    {
      nullable: true,
    },
  )
  nonConvPredilections: NonConvPredilections;

  @OneToOne((type) => Extras, (extras) => extras.player, {
    nullable: true,
  })
  extras: Extras;

  @OneToMany((type) => Train, (train) => train.player, {
    cascade: true,
  })
  @Field(() => ID)
  trains: Train[];

  @OneToOne(() => Inventory, (iv) => iv.player)
  inventory: Inventory;

  toEmbed() {
    const embeds = new EmbedBuilder();
    embeds.setTitle(this?.name || 'Defina nome usando /pj atualizar');
    if (this.avatarUrl) embeds.setImage(this.avatarUrl);
    if (this.house) {
      embeds.addFields({
        name: 'Casa ',
        value: this.house?.title || '<Definir Nome>',
      });
      embeds.setColor(this.house.color);
    }
    embeds.addFields({
      name: 'XP',
      value: this.xp.toString(),
      inline: true,
    });
    embeds.addFields({
      name: 'Galeões',
      value: this.wizardMoney.toString(),
      inline: true,
    });
    embeds.addFields({
      name: 'Libras',
      value: this.muggleMoney.toString(),
      inline: true,
    });
    return embeds;
  }
  reply(interaction: Interaction) {
    return new MessagePayload(interaction, {
      embeds: [this.toEmbed()],
    });
  }
}
