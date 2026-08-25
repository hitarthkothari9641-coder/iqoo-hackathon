export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string; // e.g. "USER_CREATED", "INSTITUTION_CREATED"
  institutionId?: string;
  aggregateId: string;
  occurredAt: Date;
  payload: T;
  metadata?: Record<string, unknown>;
}

export type DomainEventHandler<T = unknown> = (
  event: DomainEvent<T>,
) => Promise<void> | void;

export interface IEventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: DomainEventHandler<T>): void;
}
