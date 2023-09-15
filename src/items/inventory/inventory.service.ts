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

  async addItemToInventory(inventory: Inventory, item: Item, quantity: number) {
    let stack = inventory.stacks.find((i) => i.item.id === item.id);
    if (quantity === 0) throw new Error('Receber 0 items não altera o total');
    if (stack && quantity < 0) {
      stack.quantity += quantity;
      if (stack.quantity <= 0) {
        await this.stackService.delete({
          id: stack.id,
        });
        inventory.stacks = inventory.stacks.filter((i) => i.id !== stack.id);
        return;
      }
      return await this.stackService.save(stack);
    }
    if (stack) {
      stack.quantity += quantity;
      await this.stackService.save(stack);
      return stack;
    }
    stack = await this.stackService.create({
      item,
      quantity,
      inventory,
    });
    inventory.stacks.push(stack);
    await this.repo.save(inventory);
    return stack;
  }

  async get(player: Player) {
    const oldEntity = await this.findOne({
      where: {
        player: {
          id: player.id,
        },
      },
      relations: {
        stacks: {
          item: true,
        },
      },
    });
    if (oldEntity) {
      return oldEntity;
    }
    const data = this.repo.create({
      player,
    });
    const entity = await this.repo.save(data);
    return entity;
  }
}
