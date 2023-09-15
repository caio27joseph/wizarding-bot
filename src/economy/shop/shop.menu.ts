import { ButtonInteraction, InteractionReplyOptions } from 'discord.js';
import {
  ActionContext,
  MenuAction,
  MenuHelper,
} from '~/discord/helpers/menu-helper';
import { Shop } from './entities/shop.entity';

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
  async buy({ shop, interaction }: ShopMenuContext, i: ButtonInteraction) {
    await interaction.followUp({
      content: 'Purchase',
      ephemeral: true,
    });
  }

  @MenuAction('Vender')
  async sell(context: ShopMenuContext) {}
}
