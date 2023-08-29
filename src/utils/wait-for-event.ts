import { EventEmitter2 } from '@nestjs/event-emitter';

export async function waitForEvent(
  eventEmitter: EventEmitter2,
  eventName: string,
  filter: (data: any) => boolean,
): Promise<any> {
  return new Promise((resolve) => {
    const listener = (data) => {
      if (filter(data)) {
        eventEmitter.off(eventName, listener); // Remove listener
        resolve(data);
      }
    };
    eventEmitter.on(eventName, listener);
  });
}
