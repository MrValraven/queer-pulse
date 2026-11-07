import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import type { VjPackReadiness } from "../rules/vjPackReadiness";
import { useVjPackSwitch } from "./useVjPackSwitch";

const READINESS_BY_PACK: Record<string, VjPackReadiness> = {
  disco: { kind: "ready", readyCount: 6, totalCount: 6 },
  neon: { kind: "partial", readyCount: 4, totalCount: 9 },
  ballroom: { kind: "notPreloaded", totalCount: 12 },
  empty: { kind: "noScreens" },
};

const SENT: VjCommandOutcome = {
  ok: true,
  revision: 8,
  isNoop: false,
  applyAt: null,
};

function readinessOf(packId: string): VjPackReadiness {
  return READINESS_BY_PACK[packId] ?? { kind: "noScreens" };
}

/** A setPack whose answer the test hands back when it chooses. */
function deferredSetPack() {
  let answer: (outcome: VjCommandOutcome) => void = () => undefined;
  const setPack = vi.fn(
    () =>
      new Promise<VjCommandOutcome>((resolve) => {
        answer = resolve;
      }),
  );
  return { setPack, answer: (outcome: VjCommandOutcome) => answer(outcome) };
}

function renderSwitch(
  setPack: (packId: string) => Promise<VjCommandOutcome>,
  activePackId: string | null = "disco",
) {
  return renderHook(
    (props: { activePackId: string | null }) =>
      useVjPackSwitch({
        activePackId: props.activePackId,
        readinessOf,
        setPack,
      }),
    { initialProps: { activePackId } },
  );
}

describe("useVjPackSwitch", () => {
  it("sends setPack at once for a pack the screens hold ready", () => {
    const setPack = vi.fn(() => Promise.resolve(SENT));
    const { result } = renderSwitch(setPack, "neon");
    act(() => result.current.request("disco"));
    expect(setPack).toHaveBeenCalledWith("disco");
    expect(result.current.confirm).toBeNull();
  });

  it("sends at once while no screen is open", () => {
    const setPack = vi.fn(() => Promise.resolve(SENT));
    const { result } = renderSwitch(setPack);
    act(() => result.current.request("empty"));
    expect(setPack).toHaveBeenCalledWith("empty");
  });

  it("asks first for a partly loaded pack and Switch pack sends it", () => {
    const setPack = vi.fn(() => Promise.resolve(SENT));
    const { result } = renderSwitch(setPack);
    act(() => result.current.request("neon"));
    expect(setPack).not.toHaveBeenCalled();
    expect(result.current.confirm).toEqual({
      packId: "neon",
      readiness: READINESS_BY_PACK.neon,
    });
    act(() => result.current.accept());
    expect(setPack).toHaveBeenCalledWith("neon");
    expect(result.current.confirm).toBeNull();
  });

  it("asks first for a pack the screens have not loaded", () => {
    const setPack = vi.fn(() => Promise.resolve(SENT));
    const { result } = renderSwitch(setPack);
    act(() => result.current.request("ballroom"));
    expect(result.current.confirm?.readiness.kind).toBe("notPreloaded");
  });

  it("keeping the current pack sends nothing", () => {
    const setPack = vi.fn(() => Promise.resolve(SENT));
    const { result } = renderSwitch(setPack);
    act(() => result.current.request("neon"));
    act(() => result.current.dismiss());
    expect(result.current.confirm).toBeNull();
    expect(setPack).not.toHaveBeenCalled();
  });

  it("tapping the active pack sends nothing", () => {
    const setPack = vi.fn(() => Promise.resolve(SENT));
    const { result } = renderSwitch(setPack, "neon");
    act(() => result.current.request("neon"));
    expect(setPack).not.toHaveBeenCalled();
    expect(result.current.confirm).toBeNull();
  });

  it("keeps the chip pending until the stage's active pack moves", async () => {
    const { setPack, answer } = deferredSetPack();
    const { result, rerender } = renderSwitch(setPack);
    act(() => result.current.request("empty"));
    expect(result.current.pendingPackId).toBe("empty");
    await act(async () => {
      answer(SENT);
      await Promise.resolve();
    });
    expect(result.current.pendingPackId).toBe("empty");
    rerender({ activePackId: "empty" });
    expect(result.current.pendingPackId).toBeNull();
  });

  it("lets the chip go when another remote picks a different pack", () => {
    const { setPack } = deferredSetPack();
    const { result, rerender } = renderSwitch(setPack);
    act(() => result.current.request("empty"));
    rerender({ activePackId: "neon" });
    expect(result.current.pendingPackId).toBeNull();
  });

  it("lets the chip go when the send fails", async () => {
    const { setPack, answer } = deferredSetPack();
    const { result } = renderSwitch(setPack);
    act(() => result.current.request("empty"));
    await act(async () => {
      answer({ ok: false, code: "offline", errorKey: "vj:error.offline" });
      await Promise.resolve();
    });
    expect(result.current.pendingPackId).toBeNull();
  });

  it("lets the chip go when the server answers with no change", async () => {
    const { setPack, answer } = deferredSetPack();
    const { result } = renderSwitch(setPack);
    act(() => result.current.request("empty"));
    await act(async () => {
      answer({ ...SENT, isNoop: true });
      await Promise.resolve();
    });
    expect(result.current.pendingPackId).toBeNull();
  });

  it("a second tap on the pending pack sends nothing more", () => {
    const { setPack } = deferredSetPack();
    const { result } = renderSwitch(setPack);
    act(() => result.current.request("empty"));
    act(() => result.current.request("empty"));
    expect(setPack).toHaveBeenCalledTimes(1);
  });
});
