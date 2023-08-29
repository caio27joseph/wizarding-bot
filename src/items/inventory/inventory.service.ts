import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { Inventory } from './entities/inventory.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Player } from '~/core/player/entities/player.entity';
import { Item } from '../item/entities/item.entity';
import { StackService } from './stack.service';

@Injectable()
export class InventoryService extends BasicService<
  Inventory,
  DeepPartial<Inventory>,
  QueryDeepPartialEntity<Inventory>
> {
  entityName = 'Inventory';
  constructor(
    @InjectRepository(Inventory) private readonly repo: Repository<Inventory>,
    private readonly stackService: StackService,
  ) {
    super(repo);
  }

  async addItemToPlayerInventory(player: Player, item: Item, quantity: number) {
    let inventory = await this.getOrCreate(
      {
        where: {
          player: {
            id: player.id,
          },
        },
      },
      {
        player,
      },
    );
    inventory = await this.findOne({
      where: {
        id: inventory.id,
      },
      relations: {
        stacks: {
          item: true,
        },
      },
    });
    let stack = inventory.stacks.find((i) => i.item.id === item.id);
    if (stack) {
      stack.quantity += quantity;
    } else {
      stack = await this.stackService.create({
        item,
        quantity,
        inventory,
      });
      inventory.stacks.push(stack);
    }
    await this.repo.save(inventory);
    return stack;
  }
}
