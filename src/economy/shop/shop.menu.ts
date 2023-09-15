import { ButtonInteraction, InteractionReplyOptions } from 'discord.js';
import {
  ActionContext,
  MenuAction,
  MenuHelper,
} from '~/discord/helpers/menu-helper';
import { Shop } from './entities/shop.entity';
import { ShopType } from './entities/shop-item.entity';

interface ShopMenuContext extends ActionContext {
  shop: Shop;
}

export class ShopMenu extends MenuHelper<ShopMenuContext> {
  buildUpContext(context: unknown): ShopMenuContext | Promise<ShopMenuContext> {
    return context as ShopMenuContext;
  }
  getMenuPrompt(context: ShopMenuContext): InteractionReplyOptions {
    return {
      embeds: [context.shop.toEmbed()],
    };
  }

  @MenuAction('Comprar')
  async buy({ shop, interaction }: ShopMenuContext) {
    const buyItems = shop.items.filter(
      (item) => item.type === ShopType.BOTH || item.type === ShopType.BUY,
    );
    if (buyItems.length === 0) {
      return interaction.followUp({
        content: 'Não há itens para comprar nesta loja',
        ephemeral: true,
      });
    }
  }

  @MenuAction('Vender')
  async sell(context: ShopMenuContext) {}
}
