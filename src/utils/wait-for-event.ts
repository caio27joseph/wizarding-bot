import { EventEmitter2 } from '@nestjs/event-emitter';

export async function waitForEvent(
  eventEmitter: EventEmitter2,
  eventName: string,
  filter: (data: any) => boolean,
  timeoutMs: number = 5 * 60 * 1000, // Default to 5 minutes
): Promise<any> {
  return Promise.race([
    new Promise((resolve) => {
      const listener = (data) => {
        if (filter(data)) {
          eventEmitter.off(eventName, listener); // Remove listener
          resolve(data);
        }
      };
      eventEmitter.on(eventName, listener);
    }),
    new Promise((_, reject) =>
      setTimeout(() => {
        reject(new Error('Tempo esgotado'));
      }, timeoutMs),
    ),
  ]);
}
