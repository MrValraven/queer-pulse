import { describe, expect, it } from "vitest";
import { nextLocalId } from "./useMessagesController";
import { resolveSendStatus } from "./resolveSendStatus";
import type { ChatMessage } from "./data";

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

const ownMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  from: "me",
  text: "Continua a fugir",
  id: "message-1",
  at: "2026-07-24T10:00:00.000Z",
  ...overrides,
});

describe("resolveSendStatus watermarks", () => {
  const lastReadAt = "2026-07-24T10:05:00.000Z";
  const deliveredAt = "2026-07-24T10:10:00.000Z";

  it("marks an earlier own message at or before the read watermark as seen", () => {
    const earlier = ownMessage({ at: "2026-07-24T10:01:00.000Z" });
    const exactlyAtWatermark = ownMessage({ at: lastReadAt });
    expect(resolveSendStatus(earlier, lastReadAt, deliveredAt)).toBe("seen");
    expect(resolveSendStatus(exactlyAtWatermark, lastReadAt, deliveredAt)).toBe(
      "seen",
    );
  });

  it("marks a burst of own messages all seen once the watermark covers them", () => {
    const burst = ["10:01", "10:02", "10:03", "10:04"].map((time, index) =>
      ownMessage({ id: `burst-${index}`, at: `2026-07-24T${time}:00.000Z` }),
    );
    const statuses = burst.map((message) =>
      resolveSendStatus(message, lastReadAt, deliveredAt),
    );
    expect(statuses).toEqual(["seen", "seen", "seen", "seen"]);
  });

  it("marks a message after the read watermark but within the delivered watermark as delivered", () => {
    const message = ownMessage({ at: "2026-07-24T10:07:00.000Z" });
    expect(resolveSendStatus(message, lastReadAt, deliveredAt)).toBe(
      "delivered",
    );
  });

  it("marks a message after both watermarks as sent", () => {
    const message = ownMessage({ at: "2026-07-24T10:30:00.000Z" });
    expect(resolveSendStatus(message, lastReadAt, deliveredAt)).toBe("sent");
  });

  it("falls back to sent when there are no watermarks yet", () => {
    expect(resolveSendStatus(ownMessage(), null, null)).toBe("sent");
  });

  it("keeps the per-message deliveredAt stamp reading delivered", () => {
    const message = ownMessage({ deliveredAt: "2026-07-24T10:00:30.000Z" });
    expect(resolveSendStatus(message, null, null)).toBe("delivered");
  });

  it("keeps the demo status ladder working with null watermarks", () => {
    expect(
      resolveSendStatus(
        ownMessage({ id: undefined, status: "delivered" }),
        null,
        null,
      ),
    ).toBe("delivered");
    expect(
      resolveSendStatus(
        ownMessage({ id: undefined, status: "seen" }),
        null,
        null,
      ),
    ).toBe("seen");
    expect(
      resolveSendStatus(
        ownMessage({ id: undefined, status: "sent" }),
        null,
        null,
      ),
    ).toBe("sent");
  });

  it("never lets a watermark touch a failed or still-sending message", () => {
    const sending = ownMessage({ id: undefined, status: "sending" });
    const failed = ownMessage({ status: "failed" });
    expect(resolveSendStatus(sending, lastReadAt, deliveredAt)).toBe("sending");
    expect(resolveSendStatus(failed, lastReadAt, deliveredAt)).toBeNull();
  });

  it("does not compare an unacked message (no server id) against a watermark", () => {
    const unacked = ownMessage({ id: undefined, status: undefined });
    expect(resolveSendStatus(unacked, lastReadAt, deliveredAt)).toBeNull();
  });
});
