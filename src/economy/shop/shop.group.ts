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
import { Shop } from './entities/shop.entity';
import { InventoryService } from '~/items/inventory/inventory.service';
import { v4 } from 'uuid';
import { ShopType } from './entities/shop-item.entity';
import { PlayerService } from '~/core/player/player.service';
import { ShopItemService } from './shop-item.service';

@Group({
  name: 'shop',
  description: 'Comandos de economia para moderadores',
})
@Injectable()
export class ShopGroup {
  constructor(
    private readonly shopService: ShopService,
    private readonly shopItemService: ShopItemService,
    private readonly inventoryService: InventoryService,
    private readonly playerService: PlayerService,
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
    if (!shops || !shops.length) {
      return interaction.followUp({
        content: `Não há lojas em ${interaction.channel.name}`,
      });
    }

    const hash = v4();
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      shops.map(
        (shop) =>
          new ButtonBuilder({
            customId: `${hash}_${shop.id}`,
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

    const filter = (i) => {
      if (i.user.id !== interaction.user.id) return false;
      if (i.customId.split('_')[0] !== hash) return false;
      return true;
    };
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      try {
        await i.deferUpdate();
        const shop = shops.find((s) => s.id === i.customId.split('_')[1]);
        if (!shop) return;
        await this.shopMenu(guild, shop, interaction, player);
      } catch (e) {
        await interaction.followUp(e.message);
        if (guild.errorLogChannel) {
          await guild.errorLogChannel.send({
            embeds: [
              {
                title: 'Erro ao processar loja',
                description: e.message,
              },
            ],
          });
        }
      }
    });
  }
  async shopMenu(
    guild: Guild,
    shop: Shop,
    interaction: CommandInteraction,
    player: Player,
  ) {
    const inventory = await this.inventoryService.get(player);
    await interaction.editReply({
      content: `Loja ${shop.name}\n${player.name} G$ ${player.wizardMoney}`,
      embeds: [shop.toEmbed()],
    });

    if (!shop.items.length) return;
    const order = await this.shopService.shopOrder(
      interaction,
      shop,
      player,
      inventory,
    );
    if (!order) return;
    // Remove / Add in Shop
    // Add / Remove From Inventory
    if (order.action === ShopType.BUY) {
      const price = +(order.item.buyPrice * order.amount).toFixed(2);
      if (player.wizardMoney < price) {
        return interaction.followUp({
          content: `Você não tem dinheiro suficiente para comprar ${order.amount} ${order.item.item.name}`,
        });
      }
      player.wizardMoney -= price;
      const stack = await this.inventoryService.addItemToInventory(
        inventory,
        order.item.item,
        order.amount,
      );
      order.item.quantity -= order.amount;
      shop.wizardMoney += price;
      Promise.all([
        this.playerService.save(player),
        this.shopService.save(shop),
        this.shopItemService.save(order.item),
      ]);
      return interaction.followUp({
        content:
          `Você comprou ${order.amount} ${order.item.item.name} por G$ ${price}\n` +
          `Você tem G$ ${player.wizardMoney}`,
        embeds: [stack.toEmbed()],
        ephemeral: true,
      });
    } else if (order.action === ShopType.SELL) {
      const price = +(order.item.sellPrice * order.amount).toFixed(2);
      const stack = await this.inventoryService.addItemToInventory(
        inventory,
        order.item.item,
        order.amount * -1,
      );
      player.wizardMoney += price;
      order.item.quantity += order.amount;
      shop.wizardMoney -= price;

      Promise.all([
        this.playerService.save(player),
        this.shopService.save(shop),
        this.shopItemService.save(order.item),
      ]);
      return interaction.followUp({
        content:
          `Você vendeu ${order.amount} ${order.item.item.name} por G$ ${price}\n` +
          `Você tem G$ ${player.wizardMoney}`,
        embeds: stack ? [stack.toEmbed()] : [],
        ephemeral: true,
      });
    }
  }
}
