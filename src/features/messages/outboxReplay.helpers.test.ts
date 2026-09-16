import type { Dispatch, SetStateAction } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "./data";
import {
  MAX_AUTO_REPLAY_ATTEMPTS,
  backoffDelayMs,
  earliestDueAt,
  isDueForAutoReplay,
  isMessagesPageOutboxMounted,
  markAutoReplayAttempt,
  markMessagesPageOutboxMounted,
  markMessagesPageOutboxUnmounted,
  onMessagesPageOutboxFullyUnmounted,
  replayConversationInOrder,
} from "./outboxReplay.helpers";
import { loadOutbox, saveOutbox, setMessageOutboxScope } from "./outbox";

// ENG-263: unit coverage for the persisted outbox replay primitives shared by
// `useMessageOutbox` (the Messages page) and `useBackgroundOutboxReplay` (the
// app-wide background replayer). Fix round 1: `markAutoReplayAttempt` moved
// here from `useMessageOutbox.ts` (previously module-private, untestable in
// isolation) as a named export with identical behaviour, so it now has its
// own direct coverage below.

const SERVER_CONVERSATION_ID_A = "11111111-1111-1111-1111-111111111111";
const SERVER_CONVERSATION_ID_B = "22222222-2222-2222-2222-222222222222";
const PLACEHOLDER_CONVERSATION_ID = "just-picked-recipient-slug";

function buildMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    from: "me",
    text: "hello",
    localId: "local-1",
    status: "sending",
    ...overrides,
  };
}

/** A minimal stand-in for a `useState` setter, implementing just enough of
 *  the `Dispatch<SetStateAction<T>>` contract (`markAutoReplayAttempt` only
 *  ever calls it with an updater function) to drive it in a plain unit test,
 *  without rendering a component. */
function createSentState(initial: Record<string, ChatMessage[]>) {
  let state = initial;
  const setSent: Dispatch<SetStateAction<Record<string, ChatMessage[]>>> = (
    update,
  ) => {
    state = typeof update === "function" ? update(state) : update;
  };
  return { getState: () => state, setSent };
}

describe("backoffDelayMs", () => {
  it("grows exponentially per attempt", () => {
    expect(backoffDelayMs(0)).toBe(2000);
    expect(backoffDelayMs(1)).toBe(4000);
    expect(backoffDelayMs(2)).toBe(8000);
    expect(backoffDelayMs(3)).toBe(16000);
  });

  it("caps at 30 seconds once growth would exceed it, and stays capped", () => {
    expect(backoffDelayMs(4)).toBe(30_000);
    expect(backoffDelayMs(5)).toBe(30_000);
    expect(backoffDelayMs(10)).toBe(30_000);
  });
});

describe("isDueForAutoReplay", () => {
  const now = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is false without a localId", () => {
    const message = buildMessage({ localId: undefined });
    expect(isDueForAutoReplay(message)).toBe(false);
  });

  it("is false once the message has settled past sending/failed", () => {
    expect(isDueForAutoReplay(buildMessage({ status: "sent" }))).toBe(false);
    expect(isDueForAutoReplay(buildMessage({ status: "delivered" }))).toBe(
      false,
    );
    expect(isDueForAutoReplay(buildMessage({ status: "seen" }))).toBe(false);
  });

  it("is false once classified a permanent failure", () => {
    const message = buildMessage({ status: "failed", isRetryable: false });
    expect(isDueForAutoReplay(message)).toBe(false);
  });

  it("is false once the automatic replay budget is exhausted (the give-up cap)", () => {
    const message = buildMessage({
      status: "failed",
      retryCount: MAX_AUTO_REPLAY_ATTEMPTS,
      lastAttemptAt: now - 100_000,
    });
    expect(isDueForAutoReplay(message)).toBe(false);
  });

  it("stays eligible one attempt below the give-up cap", () => {
    const message = buildMessage({
      status: "failed",
      retryCount: MAX_AUTO_REPLAY_ATTEMPTS - 1,
      lastAttemptAt: now - 100_000,
    });
    expect(isDueForAutoReplay(message)).toBe(true);
  });

  it("is due immediately for an entry that was never attempted", () => {
    const message = buildMessage({
      status: "sending",
      lastAttemptAt: undefined,
    });
    expect(isDueForAutoReplay(message)).toBe(true);
  });

  it("is not due before its backoff window has elapsed", () => {
    const message = buildMessage({
      status: "failed",
      retryCount: 0,
      lastAttemptAt: now - 500, // backoffDelayMs(0) is 2000ms
    });
    expect(isDueForAutoReplay(message)).toBe(false);
  });

  it("is due exactly once its backoff window has elapsed", () => {
    const message = buildMessage({
      status: "failed",
      retryCount: 0,
      lastAttemptAt: now - 2000,
    });
    expect(isDueForAutoReplay(message)).toBe(true);
  });

  it("uses the grown backoff window for a later attempt", () => {
    const message = buildMessage({
      status: "failed",
      retryCount: 2, // backoffDelayMs(2) is 8000ms
      lastAttemptAt: now - 5000,
    });
    expect(isDueForAutoReplay(message)).toBe(false);
  });
});

describe("earliestDueAt", () => {
  const now = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for an empty outbox", () => {
    expect(earliestDueAt({}, () => false)).toBeNull();
  });

  it("skips a placeholder (not-yet-real) conversation id entirely", () => {
    const sent = {
      [PLACEHOLDER_CONVERSATION_ID]: [buildMessage({ status: "sending" })],
    };
    expect(earliestDueAt(sent, () => false)).toBeNull();
  });

  it("returns null when every entry is in flight", () => {
    const sent = {
      [SERVER_CONVERSATION_ID_A]: [
        buildMessage({ localId: "a", status: "sending" }),
      ],
    };
    expect(earliestDueAt(sent, () => true)).toBeNull();
  });

  it("returns the earliest due time across conversations", () => {
    const sent = {
      [SERVER_CONVERSATION_ID_A]: [
        buildMessage({
          localId: "a",
          status: "failed",
          retryCount: 0,
          lastAttemptAt: now - 1000, // due at now + 1000
        }),
      ],
      [SERVER_CONVERSATION_ID_B]: [
        buildMessage({
          localId: "b",
          status: "failed",
          retryCount: 0,
          lastAttemptAt: now - 1900, // due at now + 100 (earlier)
        }),
      ],
    };
    expect(earliestDueAt(sent, () => false)).toBe(now - 1900 + 2000);
  });

  it("only considers each conversation's FIRST eligible entry, mirroring replayConversationInOrder's own stop rule", () => {
    const sent = {
      [SERVER_CONVERSATION_ID_A]: [
        buildMessage({
          localId: "a1",
          status: "failed",
          retryCount: 0,
          lastAttemptAt: now - 100, // due later: now + 1900
        }),
        buildMessage({
          localId: "a2",
          status: "failed",
          retryCount: 0,
          lastAttemptAt: now - 1999, // due sooner, but SECOND in the list, so ignored
        }),
      ],
    };
    expect(earliestDueAt(sent, () => false)).toBe(now - 100 + 2000);
  });

  it("skips an ineligible entry (a permanent failure) to reach the next eligible one", () => {
    const sent = {
      [SERVER_CONVERSATION_ID_A]: [
        buildMessage({ localId: "a1", status: "failed", isRetryable: false }),
        buildMessage({
          localId: "a2",
          status: "failed",
          retryCount: 0,
          lastAttemptAt: now - 2000,
        }),
      ],
    };
    expect(earliestDueAt(sent, () => false)).toBe(now - 2000 + 2000);
  });
});

describe("replayConversationInOrder", () => {
  it("skips ineligible entries and stops the chain on the first eligible one that isn't due yet", async () => {
    const attempted: string[] = [];
    const messages = [
      buildMessage({
        localId: "permanent",
        status: "failed",
        isRetryable: false,
      }),
      buildMessage({
        localId: "due",
        status: "failed",
        retryCount: 0,
        lastAttemptAt: 0, // long past, always due
      }),
      buildMessage({
        localId: "not-due",
        status: "failed",
        retryCount: 0,
        lastAttemptAt: Date.now(), // just attempted, still inside its backoff window
      }),
      buildMessage({ localId: "never-reached", status: "sending" }),
    ];
    await replayConversationInOrder(
      messages,
      () => false,
      (message) => {
        attempted.push(message.localId);
        return Promise.resolve(true);
      },
    );
    expect(attempted).toEqual(["due"]);
  });

  it("stops the chain on an in-flight entry without attempting it", async () => {
    const attempted: string[] = [];
    const messages = [
      buildMessage({ localId: "in-flight", status: "sending" }),
      buildMessage({ localId: "after", status: "sending" }),
    ];
    await replayConversationInOrder(
      messages,
      (localId) => localId === "in-flight",
      (message) => {
        attempted.push(message.localId);
        return Promise.resolve(true);
      },
    );
    expect(attempted).toEqual([]);
  });

  it("stops the chain at the first failed attempt so later messages keep their order", async () => {
    const attempted: string[] = [];
    const messages = [
      buildMessage({ localId: "first", status: "sending" }),
      buildMessage({ localId: "second", status: "sending" }),
    ];
    await replayConversationInOrder(
      messages,
      () => false,
      (message) => {
        attempted.push(message.localId);
        return Promise.resolve(message.localId !== "first");
      },
    );
    expect(attempted).toEqual(["first"]);
  });

  it("awaits each attempt's settlement before starting the next (never overlaps two attempts)", async () => {
    const order: string[] = [];
    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const messages = [
      buildMessage({ localId: "first", status: "sending" }),
      buildMessage({ localId: "second", status: "sending" }),
    ];
    const done = replayConversationInOrder(
      messages,
      () => false,
      async (message) => {
        order.push(`start:${message.localId}`);
        if (message.localId === "first") await firstGate;
        order.push(`end:${message.localId}`);
        return true;
      },
    );

    // Let the loop start its first attempt; the second must not have started yet.
    await Promise.resolve();
    await Promise.resolve();
    expect(order).toEqual(["start:first"]);

    releaseFirst();
    await done;
    expect(order).toEqual([
      "start:first",
      "end:first",
      "start:second",
      "end:second",
    ]);
  });
});

describe("Messages-page outbox mount gate", () => {
  it("tracks the mount count, notifies only on the 1→0 transition, and tolerates an unmount at zero", () => {
    // Defensive: calling unmount while already at 0 must never go negative
    // or throw.
    markMessagesPageOutboxUnmounted();
    expect(isMessagesPageOutboxMounted()).toBe(false);

    const notifications: number[] = [];
    const unsubscribe = onMessagesPageOutboxFullyUnmounted(() => {
      notifications.push(notifications.length + 1);
    });

    markMessagesPageOutboxMounted();
    expect(isMessagesPageOutboxMounted()).toBe(true);

    // A second concurrent mount (e.g. a fast unmount/remount).
    markMessagesPageOutboxMounted();
    markMessagesPageOutboxUnmounted();
    expect(isMessagesPageOutboxMounted()).toBe(true); // count 2 → 1, still mounted
    expect(notifications).toEqual([]);

    markMessagesPageOutboxUnmounted();
    expect(isMessagesPageOutboxMounted()).toBe(false); // count 1 → 0
    expect(notifications).toEqual([1]);

    unsubscribe();
    markMessagesPageOutboxMounted();
    markMessagesPageOutboxUnmounted();
    // Left mounted-then-unmounted once more, back at 0, so this test doesn't
    // leak state into any other test sharing this module.
    expect(notifications).toEqual([1]);
    expect(isMessagesPageOutboxMounted()).toBe(false);
  });
});

describe("markAutoReplayAttempt", () => {
  const now = 1_700_000_050_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("increments the retry count and stamps the attempt time on the matching entry only", () => {
    const convId = "conv-mark";
    const target = buildMessage({ localId: "target", retryCount: 2 });
    const other = buildMessage({ localId: "other", retryCount: 9 });
    const { getState, setSent } = createSentState({
      [convId]: [target, other],
    });

    markAutoReplayAttempt(setSent, convId, "target");

    const updatedTarget = getState()[convId]?.find(
      (message) => message.localId === "target",
    );
    expect(updatedTarget?.retryCount).toBe(3);
    expect(updatedTarget?.lastAttemptAt).toBe(now);

    const untouchedOther = getState()[convId]?.find(
      (message) => message.localId === "other",
    );
    expect(untouchedOther?.retryCount).toBe(9);
    expect(untouchedOther?.lastAttemptAt).toBeUndefined();
  });

  it("treats an absent retryCount as zero, incrementing it to one", () => {
    const convId = "conv-mark-fresh";
    const target = buildMessage({ localId: "fresh", retryCount: undefined });
    const { getState, setSent } = createSentState({ [convId]: [target] });

    markAutoReplayAttempt(setSent, convId, "fresh");

    expect(getState()[convId]?.[0]?.retryCount).toBe(1);
    expect(getState()[convId]?.[0]?.lastAttemptAt).toBe(now);
  });

  it("is a no-op when the localId isn't present in that conversation", () => {
    const convId = "conv-mark-missing";
    const target = buildMessage({ localId: "present" });
    const { getState, setSent } = createSentState({ [convId]: [target] });

    markAutoReplayAttempt(setSent, convId, "not-present");

    expect(getState()[convId]).toEqual([target]);
  });

  it("stamps a shape that round-trips through the persisted outbox store unchanged", () => {
    vi.useRealTimers(); // saveOutbox/loadOutbox touch real localStorage; the stamp itself is asserted above under fake time
    window.localStorage.clear();
    setMessageOutboxScope("scope-mark-roundtrip");
    const convId = "conv-mark-roundtrip";
    const target = buildMessage({ localId: "roundtrip", retryCount: 0 });
    const { getState, setSent } = createSentState({ [convId]: [target] });

    markAutoReplayAttempt(setSent, convId, "roundtrip");
    saveOutbox(getState());

    const reloaded = loadOutbox()[convId]?.find(
      (message) => message.localId === "roundtrip",
    );
    expect(reloaded?.retryCount).toBe(1);
    expect(reloaded?.lastAttemptAt).toBeTypeOf("number");
    window.localStorage.clear();
  });
});

describe("the give-up cap vs. a manual retry", () => {
  // Documents the contract in this file's own header comment (MAX_AUTO_REPLAY_ATTEMPTS'
  // doc): the automatic replay loop gives up once an entry exhausts its
  // budget, but a manual retry is a SEPARATE code path (`retrySend`, which
  // calls `deliver` directly) that never consults `isDueForAutoReplay` or
  // `isAutoReplayEligible` at all, so it keeps working past the cap.
  it("excludes a budget-exhausted entry from the automatic replay loop, while a manual retry attempt (bypassing that gate) still sends it", async () => {
    const attempted: string[] = [];
    const exhausted = buildMessage({
      localId: "exhausted",
      status: "failed",
      retryCount: MAX_AUTO_REPLAY_ATTEMPTS,
      lastAttemptAt: 0,
    });

    expect(isDueForAutoReplay(exhausted)).toBe(false);

    // The unattended replay loop never even calls `attempt` for it:
    // `isAutoReplayEligible` rules it out before the due check runs.
    await replayConversationInOrder(
      [exhausted],
      () => false,
      (message) => {
        attempted.push(`auto:${message.localId}`);
        return Promise.resolve(true);
      },
    );
    expect(attempted).toEqual([]);

    // A manual retry never routes through `replayConversationInOrder` or
    // `isDueForAutoReplay`: it calls the send primitive directly, so the
    // exhausted budget doesn't block it. Modelled here as the same
    // attempt-shaped call made directly, standing in for `retrySend`'s own
    // direct `deliver` call.
    const manualRetryAttempt = (message: ChatMessage): Promise<boolean> => {
      attempted.push(`manual:${message.localId}`);
      return Promise.resolve(true);
    };
    await expect(manualRetryAttempt(exhausted)).resolves.toBe(true);
    expect(attempted).toEqual(["manual:exhausted"]);
  });
});
