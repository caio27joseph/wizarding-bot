import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { ShopItem } from './entities/shop-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

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

  async addItemToShop(data: DeepPartial<ShopItem>): Promise<ShopItem> {
    const item = await this.findOne({
      where: {
        shop: { id: data.shop.id },
        item: { id: data.item.id },
      },
    });
    if (item) {
      const newItem = {
        ...data,
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
