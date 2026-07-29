import { expect, it } from "vitest";
import { nextLocalId } from "./useMessagesController";

it("mints unique client message ids", () => {
  // `nextLocalId` is the client-generated idempotency key (`clientMessageId`)
  // sent with every message. It must be unique per call so the dual HTTP+WS
  // write paths and offline-outbox retries dedupe correctly on the server.
  const first = nextLocalId();
  const second = nextLocalId();
  expect(first).not.toBe(second);
  expect(first.length).toBeGreaterThan(0);
  expect(second.length).toBeGreaterThan(0);
});
