import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import { vibrateVj } from "../rules/vjHaptics";
import type { VjSendRefusal } from "./useVjOptimisticValue";
import {
  useVjThrottledDraft,
  type UseVjThrottledDraftOptions,
} from "./useVjThrottledDraft";

vi.mock("../rules/vjHaptics", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../rules/vjHaptics")>()),
  vibrateVj: vi.fn(() => true),
}));

interface PendingSend {
  value: number;
  resolve: (outcome: VjCommandOutcome) => void;
}

function acked(revision: number): VjCommandOutcome {
  return { ok: true, revision, isNoop: false, applyAt: null };
}

function renderDraft(
  overrides: Partial<UseVjThrottledDraftOptions<number>> = {},
) {
  const pendingSends: PendingSend[] = [];
  const send = vi.fn(
    (value: number) =>
      new Promise<VjCommandOutcome>((resolve) => {
        pendingSends.push({ value, resolve });
      }),
  );
  const onRefused = vi.fn<(refusal: VjSendRefusal) => void>();
  const initialProps: UseVjThrottledDraftOptions<number> = {
    serverValue: 0,
    stateRevision: 10,
    throttleMs: 50,
    send,
    isBlocked: false,
    onRefused,
    ...overrides,
  };
  const view = renderHook(
    (props: UseVjThrottledDraftOptions<number>) => useVjThrottledDraft(props),
    { initialProps },
  );
  const rerenderWith = (patch: Partial<UseVjThrottledDraftOptions<number>>) =>
    view.rerender({ ...initialProps, ...patch });
  return { ...view, send, onRefused, pendingSends, rerenderWith };
}

async function settle(pendingSend: PendingSend, outcome: VjCommandOutcome) {
  await act(async () => {
    pendingSend.resolve(outcome);
    await Promise.resolve();
  });
}

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(vibrateVj).mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useVjThrottledDraft", () => {
  it("sends at most one value per interval", () => {
    const { result, send } = renderDraft();
    act(() => result.current.change(0.1));
    expect(send.mock.calls).toEqual([[0.1]]);
    advance(10);
    act(() => result.current.change(0.2));
    advance(10);
    act(() => result.current.change(0.3));
    expect(send).toHaveBeenCalledTimes(1);
    advance(30);
    expect(send.mock.calls).toEqual([[0.1], [0.3]]);
    expect(result.current.value).toBe(0.3);
    expect(result.current.isDragging).toBe(true);
  });

  it("sends the final value on release", () => {
    const { result, send } = renderDraft();
    act(() => result.current.change(0.1));
    advance(10);
    act(() => result.current.change(0.4));
    act(() => result.current.release());
    expect(send.mock.calls).toEqual([[0.1], [0.4]]);
    expect(result.current.isDragging).toBe(false);
    advance(100);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("keeps the draft until the revision lands", async () => {
    const { result, pendingSends, rerenderWith } = renderDraft();
    act(() => result.current.change(0.6));
    act(() => result.current.release());
    const [onlySend] = pendingSends;
    if (onlySend === undefined) throw new Error("expected one send");
    await settle(onlySend, acked(12));
    expect(result.current.value).toBe(0.6);

    rerenderWith({ stateRevision: 11 });
    expect(result.current.value).toBe(0.6);

    rerenderWith({ stateRevision: 12, serverValue: 0.6 });
    expect(result.current.value).toBe(0.6);
    rerenderWith({ stateRevision: 13, serverValue: 0.2 });
    expect(result.current.value).toBe(0.2);
  });

  it("an ack for an older send leaves the newer draft in place", async () => {
    const { result, pendingSends, rerenderWith } = renderDraft();
    act(() => result.current.change(0.1));
    advance(60);
    act(() => result.current.change(0.5));
    act(() => result.current.release());
    const [olderSend, newerSend] = pendingSends;
    if (olderSend === undefined || newerSend === undefined) {
      throw new Error("expected two sends");
    }
    await settle(olderSend, acked(11));
    rerenderWith({ stateRevision: 11, serverValue: 0.1 });
    expect(result.current.value).toBe(0.5);

    await settle(newerSend, acked(12));
    rerenderWith({ stateRevision: 12, serverValue: 0.5 });
    rerenderWith({ stateRevision: 13, serverValue: 0.3 });
    expect(result.current.value).toBe(0.3);
  });

  it("drops the draft on failure", async () => {
    const { result, pendingSends, onRefused } = renderDraft({
      serverValue: 0.2,
    });
    act(() => result.current.change(0.9));
    act(() => result.current.release());
    const [onlySend] = pendingSends;
    if (onlySend === undefined) throw new Error("expected one send");
    await settle(onlySend, {
      ok: false,
      code: "vj_rate_limited",
      errorKey: "vj:error.socket.rateLimited",
    });
    expect(result.current.value).toBe(0.2);
    expect(vibrateVj).toHaveBeenCalledExactlyOnceWith("refused");
    expect(onRefused).toHaveBeenCalledExactlyOnceWith({
      code: "vj_rate_limited",
      errorKey: "vj:error.socket.rateLimited",
      errorValues: undefined,
    });
  });

  it("a blocked control sends nothing", () => {
    const { result, send } = renderDraft({ isBlocked: true });
    act(() => result.current.change(0.7));
    act(() => result.current.release());
    expect(send).not.toHaveBeenCalled();
    expect(result.current.value).toBe(0);
  });

  it("drops the pending value on unmount", () => {
    const { result, send, unmount } = renderDraft();
    act(() => result.current.change(0.1));
    act(() => result.current.change(0.2));
    unmount();
    advance(100);
    expect(send).toHaveBeenCalledTimes(1);
  });
});
