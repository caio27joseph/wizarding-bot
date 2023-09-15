import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopItemService } from './shop-item.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopItem } from './entities/shop-item.entity';
import { Shop } from './entities/shop.entity';
import { ShopGroup } from './shop.group';
import { ShopMenu } from './shop.menu';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, ShopItem])],
  providers: [ShopService, ShopItemService, ShopGroup, ShopMenu],
  exports: [ShopService, ShopItemService],
})
export class ShopModule {}
