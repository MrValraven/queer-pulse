// src/features/messages/messageInfo.test.ts
import { describe, expect, it } from "vitest";
import { resolveMessageInfoSteps } from "./messageInfo";
import type { ChatMessage } from "./data";

function ownMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "msg-1",
    from: "me",
    text: "hey",
    at: "2026-09-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("resolveMessageInfoSteps: read row (PRD-351)", () => {
  it("renders a real time on the Read row when the counterpart's read instant is recorded", () => {
    const message = ownMessage();
    const steps = resolveMessageInfoSteps(
      message,
      [message],
      "2026-09-10T12:05:00.000Z", // counterpartLastReadAt (watermark), past the message
      null,
      "2026-09-10T12:05:03.000Z", // counterpartLastReadInstant, the real read moment
    );
    expect(steps.read.isReached).toBe(true);
    expect(steps.read.at).toBe("2026-09-10T12:05:03.000Z");
  });

  it("shows no time when the read receipt is withheld (both watermark and instant null)", () => {
    const message = ownMessage();
    const steps = resolveMessageInfoSteps(
      message,
      [message],
      null, // withheld: no watermark either, same reciprocal gate as otherLastReadAt
      null,
      null, // withheld: otherLastReadInstant comes back null from the same gate
    );
    expect(steps.read.isReached).toBe(false);
    expect(steps.read.at).toBeUndefined();
  });

  it("renders a read state with NO time for a pre-column backfill read (never a 1 Jan 1970)", () => {
    const message = ownMessage();
    const steps = resolveMessageInfoSteps(
      message,
      [message],
      "2026-09-10T12:05:00.000Z", // watermark says this message WAS read
      null,
      null, // lastReadInstant column didn't exist yet when this read happened
    );
    expect(steps.read.isReached).toBe(true);
    expect(steps.read.at).toBeUndefined();
  });

  it("never reads a message as read before the counterpart's watermark reaches it", () => {
    const message = ownMessage({ at: "2026-09-10T12:10:00.000Z" });
    const steps = resolveMessageInfoSteps(
      message,
      [message],
      "2026-09-10T12:05:00.000Z", // watermark is BEFORE this message
      null,
      "2026-09-10T12:05:03.000Z",
    );
    expect(steps.read.isReached).toBe(false);
    expect(steps.read.at).toBeUndefined();
  });
});
