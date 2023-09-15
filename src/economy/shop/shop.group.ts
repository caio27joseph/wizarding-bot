import { Injectable } from '@nestjs/common';
import { Group } from '~/discord/decorators/group.decorator';
import { ShopService } from './shop.service';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
} from 'discord.js';
import {
  ArgGuild,
  ArgInteraction,
  ArgPlayer,
  ArgSpace,
} from '~/discord/decorators/message.decorators';
import { Space } from '~/spaces/space/entities/space.entity';
import { Guild } from '~/core/guild/guild.entity';
import { Player } from '~/core/player/entities/player.entity';
import { ShopMenu } from './shop.menu';

@Group({
  name: 'shop',
  description: 'Comandos de economia para moderadores',
})
@Injectable()
export class ShopGroup {
  constructor(
    private readonly shopService: ShopService,
    private readonly shopMenu: ShopMenu,
  ) {}

  @Command({
    name: 'listar',
    description: 'Lista todas as lojas de uma região',
  })
  async listShops(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgSpace() space: Space,
    @ArgGuild() guild: Guild,
    @ArgPlayer() player: Player,
  ) {
    await interaction.deferReply({ ephemeral: true });
    const shops = await space.shops;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      shops.map(
        (shop) =>
          new ButtonBuilder({
            customId: `shop_${shop.id}`,
            label: shop.name,
            style: ButtonStyle.Primary,
          }),
      ),
    );

    await interaction.followUp({
      content: `Lojas de ${interaction.channel.name}`,
      embeds: shops.map((shop) => shop.toEmbed()),
      components: [row],
    });

    const filter = (i) => i.user.id === i.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      try {
        await i.deferUpdate();
        const shop = shops.find((s) => s.id === i.customId.split('_')[1]);
        await this.shopMenu.handle({
          guild,
          shop,
          interaction,
          player,
        });
        if (!shop) return;
      } catch (e) {
        return e;
      }
    });
  }
}
