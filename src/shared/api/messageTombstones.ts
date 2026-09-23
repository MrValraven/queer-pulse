/** How many deleted message ids a realtime client remembers by default. */
const DEFAULT_TOMBSTONE_CAPACITY = 500;

/**
 * The ids of messages this client has seen deleted, so a create or edit frame
 * that arrives after the delete is dropped. Socket frames from different
 * gateway code paths carry no ordering contract: a `message:deleted` can
 * overtake the `message:new`, `conversation:message` or `message:updated` of
 * the same message, and applying that late frame would bring the deleted
 * message back (backend Task 13e).
 *
 * Bounded FIFO over a `Set`, whose insertion order makes the first entry the
 * oldest: a late frame trails its delete by moments, so remembering the most
 * recent deletes is enough.
 */
export class MessageTombstones {
  private readonly messageIds = new Set<string>();
  private readonly capacity: number;

  constructor(capacity = DEFAULT_TOMBSTONE_CAPACITY) {
    this.capacity = capacity;
  }

  record(messageId: string): void {
    this.messageIds.delete(messageId);
    this.messageIds.add(messageId);
    while (this.messageIds.size > this.capacity) {
      const oldest = this.messageIds.values().next().value;
      if (oldest === undefined) return;
      this.messageIds.delete(oldest);
    }
  }

  has(messageId: string): boolean {
    return this.messageIds.has(messageId);
  }
}
