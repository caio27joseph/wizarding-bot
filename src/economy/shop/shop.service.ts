import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { Shop } from './entities/shop.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CommandInteraction } from 'discord.js';
import { FormHelperBuilder } from '~/discord/helpers/form-helper';
import { Inventory } from '~/items/inventory/entities/inventory.entity';
import { ShopItem, ShopType } from './entities/shop-item.entity';
import { Player } from '~/core/player/entities/player.entity';
import { min, range } from 'lodash';
import { InventoryService } from '~/items/inventory/inventory.service';

@Injectable()
export class ShopService extends BasicService<
  Shop,
  DeepPartial<Shop>,
  QueryDeepPartialEntity<Shop>
> {
  entityName = 'Shop';
  constructor(@InjectRepository(Shop) private readonly repo: Repository<Shop>) {
    super(repo);
  }

  async shopOrder(
    interaction: CommandInteraction,
    shop: Shop,
    player: Player,
    inventory: Inventory,
  ) {
    const configureAction = new FormHelperBuilder<{
      action: ShopType;
      item: ShopItem;
    }>();
    configureAction.setLabel(
      `Negociar em ${shop.name}\n` + `${player.name} G$ ${player.wizardMoney}`,
    );
    configureAction.addFields(
      {
        placeholder: 'Escolha o Item',
        propKey: 'item',
        pipe: (value) => shop.items.find((item) => item.item.id === value),
        choices: shop.items.map((item) => ({
          label: item.item.name,
          value: item.item.id,
        })),
      },
      {
        placeholder: 'Comprar ou Vender',
        propKey: 'action',
        choices: [
          {
            label: 'Comprar',
            value: ShopType.BUY,
          },
          {
            label: 'Vender',
            value: ShopType.SELL,
          },
        ],
      },
    );

    const { item, action } = await configureAction.init(interaction);
    if (!item) throw new Error('Item não selecionado');
    if (!action) throw new Error('Ação não selecionada');
    let maxAmount: number;
    if (action === ShopType.BUY) {
      if (item.type === ShopType.SELL)
        throw new Error('Este item não é vendido');
      const buyCapacity = player.wizardMoney / item.buyPrice;
      if (buyCapacity === 0)
        throw new Error('Você não tem dinheiro para comprar este item');

      maxAmount = shop.infinite
        ? buyCapacity
        : min([buyCapacity, item.quantity]);
    } else {
      if (item.type === ShopType.BUY)
        throw new Error('Este item não é comprável');
      const stack = inventory.stacks.find(
        (stack) => stack.itemId === item.item.id,
      );
      if (!stack)
        throw new Error(
          'Não pode vender um item que não está em seu inventário',
        );
      const sellCapacity = shop.infinite
        ? stack.quantity
        : shop.wizardMoney / item.sellPrice;
      if (sellCapacity === 0 && shop.infinite)
        throw new Error('Você não tem items para vender');
      if (sellCapacity === 0 && shop.infinite)
        throw new Error('A loja não tem dinheiro para comprar de você');
      maxAmount = sellCapacity;
    }
    maxAmount = min([maxAmount, 25]);
    const executeAction = new FormHelperBuilder<{
      amount: number;
    }>();
    executeAction.setLabel(
      `**${action === ShopType.BUY ? 'Comprando!' : 'Vendendo'}**\n` +
        `${player.name} G$ ${player.wizardMoney}`,
    );
    executeAction.addFields({
      placeholder: 'Quantidade [1]',
      propKey: 'amount',
      defaultValue: 1,
      choices: range(1, maxAmount + 1).map((n) => ({
        label: `${item.item.name} x${n}`,
        value: n.toString(),
      })),
      pipe: (value) => parseInt(value),
    });
    const { amount } = await executeAction.init(interaction);
    return {
      item,
      action,
      amount,
    };
  }
}
