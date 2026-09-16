import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDraftSync } from "./useDraftSync";

/**
 * The cross-device draft sync layer (SOC-16) built on top of `drafts.ts`'s
 * instant localStorage copy (covered by `drafts.test.ts`). `useDemoMode` and
 * `updateConversationPrefs` are mocked so the debounce/flush behaviour can be
 * driven deterministically with fake timers, without a real network call.
 */

const state = vi.hoisted(() => ({ demoMode: false }));
const mocks = vi.hoisted(() => ({
  updateConversationPrefs: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: state.demoMode }),
}));

vi.mock("./api/messages.api", () => ({
  updateConversationPrefs: mocks.updateConversationPrefs,
}));

// A UUID-shaped id, the only shape `isServerConversationId` treats as
// syncable (see `useMessagesController.helpers.ts`).
const SERVER_CONVERSATION_ID = "11111111-1111-1111-1111-111111111111";

afterEach(() => {
  state.demoMode = false;
  mocks.updateConversationPrefs.mockClear();
  vi.useRealTimers();
});

describe("useDraftSync: inert cases", () => {
  it("never writes in demo mode", () => {
    vi.useFakeTimers();
    state.demoMode = true;
    const { result } = renderHook(() => useDraftSync(SERVER_CONVERSATION_ID));
    act(() => result.current.scheduleSync("hello"));
    act(() => result.current.syncNow("hello"));
    act(() => {
      vi.runAllTimers();
    });
    expect(mocks.updateConversationPrefs).not.toHaveBeenCalled();
  });

  it("never writes for a not-yet-server conversation id (a picked-recipient placeholder)", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDraftSync("jordan"));
    act(() => result.current.scheduleSync("hello"));
    act(() => result.current.syncNow("hello"));
    act(() => {
      vi.runAllTimers();
    });
    expect(mocks.updateConversationPrefs).not.toHaveBeenCalled();
  });
});

describe("useDraftSync: scheduleSync debounces to one write", () => {
  it("collapses a typing burst into a single write of the latest text", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDraftSync(SERVER_CONVERSATION_ID));
    act(() => result.current.scheduleSync("h"));
    act(() => result.current.scheduleSync("he"));
    act(() => result.current.scheduleSync("hel"));
    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(mocks.updateConversationPrefs).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(mocks.updateConversationPrefs).toHaveBeenCalledTimes(1);
    expect(mocks.updateConversationPrefs).toHaveBeenCalledWith(
      SERVER_CONVERSATION_ID,
      { draft: "hel" },
    );
  });
});

describe("useDraftSync: syncNow", () => {
  it("writes immediately and cancels the pending debounced write", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDraftSync(SERVER_CONVERSATION_ID));
    act(() => result.current.scheduleSync("still typing"));
    act(() => result.current.syncNow("sent this"));
    expect(mocks.updateConversationPrefs).toHaveBeenCalledTimes(1);
    expect(mocks.updateConversationPrefs).toHaveBeenCalledWith(
      SERVER_CONVERSATION_ID,
      { draft: "sent this" },
    );
    act(() => {
      vi.runAllTimers();
    });
    // The debounced write that `scheduleSync` armed must not also fire.
    expect(mocks.updateConversationPrefs).toHaveBeenCalledTimes(1);
  });
});

describe("useDraftSync: unmount flushes a pending write instead of dropping it", () => {
  it("flushes whatever was still pending on unmount/conversation switch", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() =>
      useDraftSync(SERVER_CONVERSATION_ID),
    );
    act(() => result.current.scheduleSync("about to switch threads"));
    expect(mocks.updateConversationPrefs).not.toHaveBeenCalled();
    unmount();
    expect(mocks.updateConversationPrefs).toHaveBeenCalledTimes(1);
    expect(mocks.updateConversationPrefs).toHaveBeenCalledWith(
      SERVER_CONVERSATION_ID,
      { draft: "about to switch threads" },
    );
  });

  it("does nothing on unmount when nothing was pending", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() =>
      useDraftSync(SERVER_CONVERSATION_ID),
    );
    act(() => result.current.syncNow("already sent"));
    mocks.updateConversationPrefs.mockClear();
    unmount();
    expect(mocks.updateConversationPrefs).not.toHaveBeenCalled();
  });
});
