import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "./data";
import { useOutboxReplayTimer } from "./useOutboxReplayTimer";

// ENG-263 fix round 1: unit coverage for `useOutboxReplayTimer`, the ENG-208
// backoff timer split out of `useMessageOutbox.ts`. Every test drives it with
// real `@testing-library/react` fake timers rather than reimplementing
// `earliestDueAt`'s math, so the assertions stay honest about the hook's
// actual scheduling behaviour.

const SERVER_CONVERSATION_ID = "11111111-1111-1111-1111-111111111111";

function buildMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    from: "me",
    text: "hello",
    localId: "local-1",
    status: "failed",
    retryCount: 0,
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useOutboxReplayTimer", () => {
  it("never schedules a timer in demo mode, even with a due entry", () => {
    const onDue = vi.fn();
    const sent = {
      [SERVER_CONVERSATION_ID]: [buildMessage({ lastAttemptAt: 0 })],
    };
    renderHook(() =>
      useOutboxReplayTimer({
        sent,
        demoMode: true,
        isInFlight: () => false,
        onDue,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onDue).not.toHaveBeenCalled();
  });

  it("never schedules a timer while the browser is offline", () => {
    vi.stubGlobal("navigator", { onLine: false });
    const onDue = vi.fn();
    const sent = {
      [SERVER_CONVERSATION_ID]: [buildMessage({ lastAttemptAt: 0 })],
    };
    renderHook(() =>
      useOutboxReplayTimer({
        sent,
        demoMode: false,
        isInFlight: () => false,
        onDue,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onDue).not.toHaveBeenCalled();
  });

  it("schedules nothing when no entry in the outbox is currently eligible", () => {
    const onDue = vi.fn();
    renderHook(() =>
      useOutboxReplayTimer({
        sent: {},
        demoMode: false,
        isInFlight: () => false,
        onDue,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onDue).not.toHaveBeenCalled();
  });

  it("computes its delay from the earliest due entry and fires onDue exactly then", () => {
    const now = 1_700_000_000_000;
    vi.setSystemTime(now);
    const onDue = vi.fn();
    // retryCount 0 → backoffDelayMs(0) is 2000ms; lastAttemptAt is now - 500,
    // so this entry becomes due at now + 1500.
    const sent = {
      [SERVER_CONVERSATION_ID]: [
        buildMessage({ retryCount: 0, lastAttemptAt: now - 500 }),
      ],
    };
    renderHook(() =>
      useOutboxReplayTimer({
        sent,
        demoMode: false,
        isInFlight: () => false,
        onDue,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(onDue).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDue).toHaveBeenCalledTimes(1);
  });

  it("skips a conversation whose earliest eligible entry is already in flight", () => {
    const now = 1_700_000_000_000;
    vi.setSystemTime(now);
    const onDue = vi.fn();
    const sent = {
      [SERVER_CONVERSATION_ID]: [
        buildMessage({
          localId: "in-flight-entry",
          retryCount: 0,
          lastAttemptAt: now - 500,
        }),
      ],
    };
    renderHook(() =>
      useOutboxReplayTimer({
        sent,
        demoMode: false,
        isInFlight: (localId) => localId === "in-flight-entry",
        onDue,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onDue).not.toHaveBeenCalled();
  });

  it("re-arms the timer when the entries change, clearing the earlier schedule rather than stacking a second one", () => {
    const now = 1_700_000_000_000;
    vi.setSystemTime(now);
    const onDue = vi.fn();
    const firstEntryDueSoon = {
      [SERVER_CONVERSATION_ID]: [
        buildMessage({
          localId: "a",
          retryCount: 0,
          lastAttemptAt: now - 500, // due at now + 1500
        }),
      ],
    };
    const { rerender } = renderHook(
      (props: { sent: Record<string, ChatMessage[]> }) =>
        useOutboxReplayTimer({
          sent: props.sent,
          demoMode: false,
          isInFlight: () => false,
          onDue,
        }),
      { initialProps: { sent: firstEntryDueSoon } },
    );

    // 500ms elapsed: the first entry's own due time is still 1000ms away.
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Replace it with a fresh entry, due later. The earlier schedule must be
    // cleared so only the new one ever runs.
    const laterEntry = {
      [SERVER_CONVERSATION_ID]: [
        buildMessage({
          localId: "b",
          retryCount: 0,
          lastAttemptAt: Date.now(), // due 2000ms from THIS point
        }),
      ],
    };
    rerender({ sent: laterEntry });

    // Advance past when the FIRST entry would have fired, had its timer not
    // been cleared on rerender (original due was at +1500ms from the start;
    // 1000ms more brings total elapsed time to 1500ms).
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onDue).not.toHaveBeenCalled();

    // Advance to the new entry's own due time (2000ms after the rerender).
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onDue).toHaveBeenCalledTimes(1);
  });

  it("clears the scheduled timer on unmount so onDue stays uncalled", () => {
    const now = 1_700_000_000_000;
    vi.setSystemTime(now);
    const onDue = vi.fn();
    const sent = {
      [SERVER_CONVERSATION_ID]: [
        buildMessage({ retryCount: 0, lastAttemptAt: now - 500 }),
      ],
    };
    const { unmount } = renderHook(() =>
      useOutboxReplayTimer({
        sent,
        demoMode: false,
        isInFlight: () => false,
        onDue,
      }),
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onDue).not.toHaveBeenCalled();
  });
});
