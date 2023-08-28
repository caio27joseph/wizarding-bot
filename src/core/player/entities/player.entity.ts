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
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { House } from '~/core/house/entities/house.entity';
import { DiscordEntityVieable } from '~/discord/types';
import { Grimoire } from '~/grimoire/entities/grimoire.entity';
import { PointLog } from '~/house-cup/point-logs/entities/point-log.entity';
import { Abilities } from '~/player-system/abilities/entities/abilities.entity';
import { Attributes } from '~/player-system/attribute/entities/attributes.entity';
import { Competences } from '~/player-system/competences/entities/competences.entity';
import { Extras } from '~/player-system/extras/entities/extras.entity';
import { NonConvPredilections } from '~/player-system/nonconv-predilection/entities/nonconv-predilections.entity';
import { WitchPredilection } from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { Spell } from '~/spell/entities/spell.entity';
import { Train } from '~/train/entities/train.entity';

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

  @OneToOne((type) => Competences, (competences) => competences.player, {
    nullable: true,
  })
  competences: Competences;

  @OneToOne(
    (type) => WitchPredilection,
    (witchPredilections) => witchPredilections.player,
    {
      nullable: true,
    },
  )
  witchPredilections: WitchPredilection;

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
