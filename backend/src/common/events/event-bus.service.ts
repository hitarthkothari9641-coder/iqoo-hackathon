import { Injectable, Logger } from '@nestjs/common';
import {
  DomainEvent,
  DomainEventHandler,
  IEventBus,
} from './domain-event.interface';

@Injectable()
export class EventBusService implements IEventBus {
  private readonly logger = new Logger(EventBusService.name);
  private readonly handlers = new Map<string, DomainEventHandler[]>();

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    this.logger.debug(
      `[EVENT] Publishing: ${event.eventType} (Aggregate: ${event.aggregateId})`,
    );
    const registeredHandlers = this.handlers.get(event.eventType) || [];

    for (const handler of registeredHandlers) {
      try {
        await handler(event);
      } catch (err) {
        this.logger.error(
          `[EVENT ERROR] Failed handler for ${event.eventType}: ${(err as Error).message}`,
        );
      }
    }
  }

  subscribe<T>(eventType: string, handler: DomainEventHandler<T>): void {
    const current = this.handlers.get(eventType) || [];
    current.push(handler as DomainEventHandler);
    this.handlers.set(eventType, current);
    this.logger.debug(`[EVENT] Subscribed handler for: ${eventType}`);
  }
}
