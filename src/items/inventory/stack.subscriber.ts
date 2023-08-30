import {
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent,
} from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Stack } from './entities/stack.entity';
@EventSubscriber()
export class StackSubscriber implements EntitySubscriberInterface<Stack> {
  /**
   * Indicates that this subscriber only listen to Stack events.
   */
  listenTo() {
    return Stack;
  }

  /**
   * Called after entity is updated.
   */
  async afterUpdate(event: UpdateEvent<Stack>) {
    const stack = event.entity as Stack;
    const inventoryRepo = event.manager.getRepository(Inventory);
    const inventory = await inventoryRepo.findOne({
      where: {
        id: stack.inventoryId,
      },
    });
    if (inventory) {
      inventory.updatedAt = new Date();
      await inventoryRepo.save(inventory);
    }
  }
}
