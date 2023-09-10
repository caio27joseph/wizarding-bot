import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EmbedBuilder, Interaction, InteractionReplyOptions } from 'discord.js';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { DiscordEntityVieable } from '~/discord/types';
import {
  CanHaveBonus,
  Bonus,
  BonusTarget,
} from '~/items/bonuses/item-with-bonus.interface';
import { Inventory } from '~/items/inventory/entities/inventory.entity';
import { ItemPoolRarity } from '~/items/item-pool/entitites/item-pool-config.entity';
import { ResourceProvider } from '~/items/resource-provider/resource-provider.entity';

@Entity()
@ObjectType()
export class Item implements DiscordEntityVieable, CanHaveBonus {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  rarity?: ItemPoolRarity;

  @Column()
  @Field()
  imageUrl: string;

  @Column({ default: false })
  @Field()
  unique: boolean;

  @ManyToOne(() => Inventory)
  @JoinColumn()
  owner: Inventory;

  @ManyToOne(() => Guild)
  @JoinColumn()
  guild: Guild;

  @Column()
  @Field()
  guildId: string;

  @Column({
    type: 'json',
    default: [],
  })
  bonuses: Bonus<BonusTarget>[];

  @OneToMany(
    () => ResourceProvider,
    (resourceProvider) => resourceProvider.item,
  )
  resourceProviders: ResourceProvider[];

  toEmbed() {
    const embed = new EmbedBuilder()
      .setTitle(this.name)
      .setDescription(this.description);
    if (this.imageUrl) {
      embed.setImage(this.imageUrl);
    }
    return embed;
  }
  reply(interaction: Interaction) {
    throw new Error('Method not implemented.');
  }
}
