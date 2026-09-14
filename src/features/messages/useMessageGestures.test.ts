import { act, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useMessageGestures } from "./useMessageGestures";

/**
 * The tap arbitration only. Swipe and long-press behaviour is unchanged by
 * this task and is exercised through the bubble's own tests.
 */
function setup(overrides: Partial<Parameters<typeof useMessageGestures>[0]>) {
  const bubbleRef = createRef<HTMLElement>();
  const hintRef = createRef<HTMLSpanElement>();
  return renderHook(() =>
    useMessageGestures({
      enabled: true,
      onOpenActions: vi.fn(),
      replyDirection: "right",
      bubbleRef,
      hintRef,
      reducedMotion: false,
      ...overrides,
    }),
  );
}

/** A pointer event shaped enough for the hook's own reads. */
function pointerEvent(overrides: Record<string, unknown> = {}) {
  return {
    pointerId: 1,
    pointerType: "touch",
    clientX: 10,
    clientY: 10,
    button: 0,
    currentTarget: document.createElement("div"),
    target: document.createElement("div"),
    ...overrides,
  } as unknown as React.PointerEvent;
}

describe("useMessageGestures tap arbitration", () => {
  it("fires onActivate on the first tap when the bubble has a tap action", () => {
    const onActivate = vi.fn();
    const onQuickReact = vi.fn();
    const { result } = setup({ onActivate, onQuickReact });
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent());
      result.current.handlers.onPointerUp(pointerEvent());
    });
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onQuickReact).not.toHaveBeenCalled();
  });

  it("still needs two taps for the quick reaction when there is no tap action", () => {
    const onQuickReact = vi.fn();
    const { result } = setup({ onQuickReact });
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent());
      result.current.handlers.onPointerUp(pointerEvent());
    });
    expect(onQuickReact).not.toHaveBeenCalled();
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent());
      result.current.handlers.onPointerUp(pointerEvent());
    });
    expect(onQuickReact).toHaveBeenCalledTimes(1);
  });

  it("ignores a tap that moved past the slop", () => {
    const onActivate = vi.fn();
    const { result } = setup({ onActivate });
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent());
      result.current.handlers.onPointerUp(pointerEvent({ clientX: 200 }));
    });
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("ignores a tap on an interactive descendant", () => {
    const onActivate = vi.fn();
    const { result } = setup({ onActivate });
    const button = document.createElement("button");
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent({ target: button }));
      result.current.handlers.onPointerUp(pointerEvent({ target: button }));
    });
    expect(onActivate).not.toHaveBeenCalled();
  });

  // Regression for the critical whole-branch review finding: an id-less photo
  // bubble (every demo-mode photo, and a live one between send and ack, or
  // restored from the offline outbox) was fully dead to a tap, because
  // `enabled: false` short-circuited `onPointerDown` before it ever reached
  // `onActivate`. The fix widens `enabled` for a bubble with a tap action to
  // reach, while `onOpenActions` stays independently gated by the consumer
  // (`MessageBubble`) at its own call site, not by this hook.
  it("fires onActivate on a tap when the bubble is gesture-enabled with no action overlay to open", () => {
    const onActivate = vi.fn();
    const { result } = setup({ onActivate, onOpenActions: undefined });
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent());
      result.current.handlers.onPointerUp(pointerEvent());
    });
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("fires onOpenActions on a long-press when it is supplied", () => {
    vi.useFakeTimers();
    try {
      const onOpenActions = vi.fn();
      const { result } = setup({ onOpenActions });
      act(() => {
        result.current.handlers.onPointerDown(
          pointerEvent({ pointerType: "touch" }),
        );
        vi.advanceTimersByTime(500);
      });
      expect(onOpenActions).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not throw on a long-press when onOpenActions is absent (id-less photo bubble)", () => {
    // This is exactly the trap in the fix: widening `enabled` so an id-less
    // photo bubble can tap-to-open ALSO widens what feeds `useLongPress`. If
    // this hook forwarded an absent `onOpenActions` straight through instead
    // of wrapping it, a long-press on that same bubble would call `undefined`
    // as a function and crash, rather than leaving the action overlay closed.
    vi.useFakeTimers();
    try {
      const { result } = setup({ onOpenActions: undefined });
      expect(() => {
        act(() => {
          result.current.handlers.onPointerDown(
            pointerEvent({ pointerType: "touch" }),
          );
          vi.advanceTimersByTime(500);
        });
      }).not.toThrow();
    } finally {
      vi.useRealTimers();
    }
  });
});
