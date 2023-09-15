import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgBoolean,
  ArgGuild,
  ArgInteger,
  ArgInteraction,
  ArgNumber,
  ArgSpace,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { Space } from '~/spaces/space/entities/space.entity';
import { ShopService } from './shop/shop.service';
import { Shop } from './shop/entities/shop.entity';
import { ShopType, ShopTypePtBr } from './shop/entities/shop-item.entity';
import { ILike } from 'typeorm';
import { ShopItemService } from './shop/shop-item.service';
import { ItemService } from '~/items/item/item.service';
import { Guild } from '~/core/guild/guild.entity';

@Group({
  name: 'mod_economy',
  description: 'Comandos de economia para moderadores',
})
@Injectable()
export class EconomyModGroup {
  selects = new Map<string, Shop>();

  constructor(
    private readonly shopService: ShopService,
    private readonly shopItemService: ShopItemService,
    private readonly itemService: ItemService,
  ) {}

  @Command({
    name: 'shop_create',
    description: 'Cria uma loja',
    mod: true,
  })
  async shopCreate(
    @ArgInteraction() i: CommandInteraction,
    @ArgSpace() space: Space,
    @ArgString({ name: 'nome', description: 'Nome da loja', required: false })
    name?: string,
    @ArgBoolean({
      name: 'Infinito',
      description: 'Define se a loja tem estoque infinito',
      required: false,
    })
    infinite?: boolean,
  ) {
    await i.deferReply({ ephemeral: true });
    const shops = await space.shops;
    if (shops.length >= 5)
      return i.followUp(
        'Não é possível criar mais lojas, o limite de lojas por região é 5',
      );
    const exists = await this.shopService.findOne({
      where: {
        name: ILike(name ?? i.channel.name),
        space: {
          id: space.id,
        },
      },
    });
    if (exists)
      return i.followUp(
        'Já existe uma loja com esse nome nessa região, escolha outro nome',
      );
    const shop = await this.shopService.create({
      name: name ?? i.channel.name,
      space,
      infinite,
    });
    this.selects.set(i.user.id, shop);
    return i.followUp({
      content: `Loja criada com sucesso!`,
      embeds: [shop.toEmbed()],
    });
  }
  @Command({
    name: 'shop_select',
    description: 'Seleciona uma loja',
    mod: true,
  })
  async shopSelect(
    @ArgInteraction() i: CommandInteraction,
    @ArgSpace() space: Space,
    @ArgString({ name: 'nome', description: 'Nome da loja', required: false })
    name?: string,
    @ArgString({
      name: 'id',
      description: 'Id da loja',
      required: false,
    })
    id?: string,
  ) {
    await i.deferReply({ ephemeral: true });
    const shop = await this.shopService.findOne({
      where: [
        {
          id,
        },
        {
          name: ILike(name),
          space: {
            id: space.id,
          },
        },
      ],
    });
    this.selects.set(i.user.id, shop);
    return i.followUp({
      content: `Loja selecionada com sucesso!`,
      embeds: [shop.toEmbed()],
    });
  }

  @Command({
    name: 'shop_add_item',
    description: 'Adiciona um item a loja',
    mod: true,
  })
  async shopAddItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgString({
      name: 'item',
      description: 'Item para se adicionar no shopping',
    })
    itemName: string,
    @ArgString({
      name: 'tipo',
      description: 'Preço do item',
      choices: Object.entries(ShopTypePtBr).map(([value, name]) => ({
        name,
        value,
      })),
    })
    type: ShopType,
    @ArgNumber({
      name: 'preço_para_comprar_na_loja',
      description: 'Preço do item',
      required: false,
    })
    buyPrice?: number,
    @ArgNumber({
      name: 'preço_para_vender_na_loja',
      description: 'Preço do item',
      required: false,
    })
    sellPrice?: number,
    @ArgInteger({
      name: 'quantidade',
      description: 'Quantidade do item',
      required: false,
    })
    quantity?: number,
  ) {
    await i.deferReply({ ephemeral: true });
    const shop = this.selects.get(i.user.id);
    if (!shop)
      return i.followUp(
        'Nenhuma loja selecionada, use o comando `shop_select` para selecionar uma loja',
      );
    shop.items = shop.items || [];

    const item = await this.itemService.findOneOrFail({
      where: {
        name: ILike(itemName),
        guildId: guild.id,
      },
    });

    const shopItem = await this.shopItemService.addItemToShop(shop, {
      shop,
      item,
      type,
      sellPrice: sellPrice || +(buyPrice / 3).toFixed(2),
      buyPrice,
      quantity,
    });
    shop.items.push(shopItem);

    return i.followUp({
      content: `Item adicionado com sucesso!`,
      embeds: [shop.toEmbed()],
    });
  }
}
