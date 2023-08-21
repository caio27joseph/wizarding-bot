import { EmbedBuilder, Interaction } from 'discord.js';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { DiscordEntityVieable } from '~/discord/types';
import { ResourceProvider } from '~/items/resource-provider/resource-provider.entity';

@Entity()
export class Item implements DiscordEntityVieable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => Guild)
  guild: Guild;

  @Column()
  guildId: string;

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
