import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import { vibrateVj } from "../rules/vjHaptics";
import {
  useVjOptimisticValue,
  type UseVjOptimisticValueOptions,
  type VjSendRefusal,
} from "./useVjOptimisticValue";

vi.mock("../rules/vjHaptics", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../rules/vjHaptics")>()),
  vibrateVj: vi.fn(() => true),
}));

interface Deferred {
  promise: Promise<VjCommandOutcome>;
  resolve: (outcome: VjCommandOutcome) => void;
}

function deferredOutcome(): Deferred {
  let resolve: (outcome: VjCommandOutcome) => void = () => undefined;
  const promise = new Promise<VjCommandOutcome>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function acked(revision: number): VjCommandOutcome {
  return { ok: true, revision, isNoop: false, applyAt: null };
}

const tooManyEffects: VjCommandOutcome = {
  ok: false,
  code: "vj_effects_too_many",
  errorKey: "vj:error.socket.effectsTooMany",
  errorValues: { max: 8 },
};

function renderOptimistic(stateRevision: number | null = 10) {
  const onRefused = vi.fn<(refusal: VjSendRefusal, key: string) => void>();
  const view = renderHook(
    (props: UseVjOptimisticValueOptions) =>
      useVjOptimisticValue<boolean>(props),
    { initialProps: { stateRevision, onRefused } },
  );
  const setRevision = (revision: number | null) =>
    view.rerender({ stateRevision: revision, onRefused });
  return { ...view, onRefused, setRevision };
}

const key = "effect:invert";

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(vibrateVj).mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useVjOptimisticValue", () => {
  it("shows the value before the ack", () => {
    const { result } = renderOptimistic();
    const send = deferredOutcome();
    act(() => {
      void result.current.apply(key, true, () => send.promise);
    });
    expect(result.current.valueOf(key, false)).toBe(true);
    expect(result.current.isPending(key)).toBe(true);
  });

  it("keeps it until the state revision catches up", async () => {
    const { result, setRevision } = renderOptimistic(10);
    const send = deferredOutcome();
    act(() => {
      void result.current.apply(key, true, () => send.promise);
    });
    await act(async () => {
      send.resolve(acked(12));
      await send.promise;
    });
    expect(result.current.valueOf(key, false)).toBe(true);

    setRevision(11);
    expect(result.current.valueOf(key, false)).toBe(true);

    setRevision(12);
    expect(result.current.valueOf(key, false)).toBe(false);
    expect(result.current.isPending(key)).toBe(false);
  });

  it("settles at once when the state already reached the acked revision", async () => {
    const { result, setRevision } = renderOptimistic(10);
    const send = deferredOutcome();
    act(() => {
      void result.current.apply(key, true, () => send.promise);
    });
    setRevision(12);
    expect(result.current.isPending(key)).toBe(true);
    await act(async () => {
      send.resolve(acked(12));
      await send.promise;
    });
    expect(result.current.isPending(key)).toBe(false);
  });

  it("rolls back on a refusal", async () => {
    const { result, onRefused } = renderOptimistic();
    const send = deferredOutcome();
    const applied: { promise: Promise<VjCommandOutcome> | null } = {
      promise: null,
    };
    act(() => {
      applied.promise = result.current.apply(key, true, () => send.promise);
    });
    await act(async () => {
      send.resolve(tooManyEffects);
      await applied.promise;
    });
    expect(await applied.promise).toEqual(tooManyEffects);
    expect(result.current.valueOf(key, false)).toBe(false);
    expect(vibrateVj).toHaveBeenCalledExactlyOnceWith("refused");
    expect(onRefused).toHaveBeenCalledExactlyOnceWith(
      {
        code: "vj_effects_too_many",
        errorKey: "vj:error.socket.effectsTooMany",
        errorValues: { max: 8 },
      },
      key,
    );
  });

  it("rolls back a silent code quietly", async () => {
    const { result, onRefused } = renderOptimistic();
    const send = deferredOutcome();
    act(() => {
      void result.current.apply(key, true, () => send.promise);
    });
    await act(async () => {
      send.resolve({ ok: false, code: "vj_stale_setlist", errorKey: null });
      await send.promise;
    });
    expect(result.current.isPending(key)).toBe(false);
    expect(vibrateVj).not.toHaveBeenCalled();
    expect(onRefused).not.toHaveBeenCalled();
  });

  it("a late ack for an older send leaves the newer send pending", async () => {
    const { result, setRevision } = renderOptimistic(10);
    const olderSend = deferredOutcome();
    const newerSend = deferredOutcome();
    act(() => {
      void result.current.apply(key, true, () => olderSend.promise);
    });
    act(() => {
      vi.advanceTimersByTime(5);
      void result.current.apply(key, false, () => newerSend.promise);
    });
    await act(async () => {
      olderSend.resolve(acked(11));
      await olderSend.promise;
    });
    setRevision(11);
    expect(result.current.isPending(key)).toBe(true);
    expect(result.current.valueOf(key, true)).toBe(false);

    await act(async () => {
      newerSend.resolve(acked(12));
      await newerSend.promise;
    });
    setRevision(12);
    expect(result.current.isPending(key)).toBe(false);
  });

  it("a late refusal for an older send leaves the newer send alone", async () => {
    const { result, onRefused } = renderOptimistic(10);
    const olderSend = deferredOutcome();
    const newerSend = deferredOutcome();
    act(() => {
      void result.current.apply(key, true, () => olderSend.promise);
    });
    act(() => {
      vi.advanceTimersByTime(5);
      void result.current.apply(key, false, () => newerSend.promise);
    });
    await act(async () => {
      olderSend.resolve(tooManyEffects);
      await olderSend.promise;
    });
    expect(result.current.isPending(key)).toBe(true);
    expect(result.current.valueOf(key, true)).toBe(false);
    expect(onRefused).not.toHaveBeenCalled();
  });

  it("drops an entry whose ack never came after 6 s", () => {
    const { result } = renderOptimistic();
    act(() => {
      void result.current.apply(
        key,
        true,
        () => new Promise<VjCommandOutcome>(() => undefined),
      );
    });
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.isPending(key)).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1_500);
    });
    expect(result.current.isPending(key)).toBe(false);
  });
});
