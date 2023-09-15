import { Module } from '@nestjs/common';
import { ShopModule } from './shop/shop.module';
import { ItemModule } from '~/items/item/item.module';
import { EconomyModGroup } from './economy-mod.group';

@Module({
  imports: [ShopModule, ItemModule],
  providers: [EconomyModGroup],
})
export class EconomyModule {}
