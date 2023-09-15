import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { ShopItem } from './entities/shop-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Shop } from './entities/shop.entity';

@Injectable()
export class ShopItemService extends BasicService<
  ShopItem,
  DeepPartial<ShopItem>,
  QueryDeepPartialEntity<ShopItem>
> {
  entityName = 'ShopItem';
  constructor(
    @InjectRepository(ShopItem) private readonly repo: Repository<ShopItem>,
  ) {
    super(repo);
  }

  async addItemToShop(
    shop: Shop,
    data: DeepPartial<ShopItem>,
  ): Promise<ShopItem> {
    const items = shop.items;
    if (items.length >= 25) {
      throw new Error('Não é possível adicionar mais itens a esta loja');
    }
    const item = await this.findOne({
      where: {
        shop: { id: shop.id },
        item: { id: data.item.id },
      },
    });
    if (item) {
      const newItem = {
        ...data,
        shop,
        quantity: item.quantity + data.quantity,
      };
      await this.update(
        {
          id: item.id,
        },
        newItem,
      );
      return this.repo.create(newItem);
    }
    return this.create(data);
  }
}
