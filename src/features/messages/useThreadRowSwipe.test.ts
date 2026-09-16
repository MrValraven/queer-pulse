import { act, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useThreadRowSwipe } from "./useThreadRowSwipe";

/**
 * DES-186 regression coverage: the interactive-target bail-out used to be
 * `useMessageGestures`'s `isInteractiveTarget`, whose `closest("button, …")`
 * always matched the row `<button>` itself (the pointer handlers live ON that
 * button), so a swipe could never engage on any device. These tests exercise
 * `useThreadRowSwipe`'s own row-aware replacement directly against a real
 * button node, the way the row actually wires it.
 */
function setup(
  overrides: Partial<Parameters<typeof useThreadRowSwipe>[0]> = {},
) {
  const rowRef = createRef<HTMLButtonElement>();
  rowRef.current = document.createElement("button");
  const leadingIconRef = createRef<HTMLSpanElement>();
  leadingIconRef.current = document.createElement("span");
  const trailingIconRef = createRef<HTMLSpanElement>();
  trailingIconRef.current = document.createElement("span");
  const onSwipePin = vi.fn();
  const onSwipeFavorite = vi.fn();
  const hook = renderHook(() =>
    useThreadRowSwipe({
      enabled: true,
      onSwipePin,
      onSwipeFavorite,
      rowRef,
      leadingIconRef,
      trailingIconRef,
      reducedMotion: false,
      ...overrides,
    }),
  );
  return { ...hook, rowRef, onSwipePin, onSwipeFavorite };
}

/** A pointer event shaped enough for the hook's own reads. `target` defaults
 *  to the row button itself, where the row's real `onPointerDown` handler
 *  actually sits, unlike a bubble's gesture, which starts on an inner span. */
function pointerEvent(
  overrides: Record<string, unknown> = {},
  rowNode?: HTMLElement,
) {
  return {
    pointerId: 1,
    pointerType: "touch",
    clientX: 0,
    clientY: 0,
    target: rowNode ?? document.createElement("div"),
    ...overrides,
  } as unknown as React.PointerEvent;
}

describe("useThreadRowSwipe", () => {
  it("engages and fires onSwipePin on a rightward swipe past the trigger threshold, starting on the row button itself", () => {
    const { result, rowRef, onSwipePin, onSwipeFavorite } = setup();
    const row = rowRef.current!;
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent({}, row));
      result.current.handlers.onPointerMove(pointerEvent({ clientX: 60 }, row));
    });
    expect(result.current.swiping).toBe(true);
    act(() => {
      result.current.handlers.onPointerUp(pointerEvent({ clientX: 60 }, row));
    });
    expect(onSwipePin).toHaveBeenCalledTimes(1);
    expect(onSwipeFavorite).not.toHaveBeenCalled();
    expect(result.current.swiping).toBe(false);
    // An engaged swipe consumes the row's own click so it doesn't also open
    // the thread underneath it.
    expect(result.current.consumeSwipeClick()).toBe(true);
    expect(result.current.consumeSwipeClick()).toBe(false);
  });

  it("fires onSwipeFavorite on a leftward swipe past the trigger threshold", () => {
    const { result, rowRef, onSwipePin, onSwipeFavorite } = setup();
    const row = rowRef.current!;
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent({}, row));
      result.current.handlers.onPointerMove(
        pointerEvent({ clientX: -60 }, row),
      );
      result.current.handlers.onPointerUp(pointerEvent({ clientX: -60 }, row));
    });
    expect(onSwipeFavorite).toHaveBeenCalledTimes(1);
    expect(onSwipePin).not.toHaveBeenCalled();
  });

  it("snaps back without firing either action when released under the trigger threshold", () => {
    const { result, rowRef, onSwipePin, onSwipeFavorite } = setup();
    const row = rowRef.current!;
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent({}, row));
      result.current.handlers.onPointerMove(pointerEvent({ clientX: 20 }, row));
      result.current.handlers.onPointerUp(pointerEvent({ clientX: 20 }, row));
    });
    expect(onSwipePin).not.toHaveBeenCalled();
    expect(onSwipeFavorite).not.toHaveBeenCalled();
    // Still an engaged drag (crossed the engage threshold), so the click is
    // consumed even though it landed under the fire threshold.
    expect(result.current.consumeSwipeClick()).toBe(true);
  });

  it("never engages a swipe started with a mouse pointer (desktop uses the ⋯ menu)", () => {
    const { result, rowRef, onSwipePin, onSwipeFavorite } = setup();
    const row = rowRef.current!;
    act(() => {
      result.current.handlers.onPointerDown(
        pointerEvent({ pointerType: "mouse" }, row),
      );
      result.current.handlers.onPointerMove(
        pointerEvent({ pointerType: "mouse", clientX: 60 }, row),
      );
      result.current.handlers.onPointerUp(
        pointerEvent({ pointerType: "mouse", clientX: 60 }, row),
      );
    });
    expect(result.current.swiping).toBe(false);
    expect(onSwipePin).not.toHaveBeenCalled();
    expect(onSwipeFavorite).not.toHaveBeenCalled();
    expect(result.current.consumeSwipeClick()).toBe(false);
  });

  it("does not engage when the press starts on an interactive descendant NESTED inside the row (unlike the row button itself)", () => {
    const { result, rowRef, onSwipePin, onSwipeFavorite } = setup();
    const row = rowRef.current!;
    const nestedButton = document.createElement("button");
    row.appendChild(nestedButton);
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent({}, nestedButton));
      result.current.handlers.onPointerMove(
        pointerEvent({ clientX: 60 }, nestedButton),
      );
      result.current.handlers.onPointerUp(
        pointerEvent({ clientX: 60 }, nestedButton),
      );
    });
    expect(result.current.swiping).toBe(false);
    expect(onSwipePin).not.toHaveBeenCalled();
    expect(onSwipeFavorite).not.toHaveBeenCalled();
    expect(result.current.consumeSwipeClick()).toBe(false);
  });

  it("does nothing when disabled", () => {
    const { result, rowRef, onSwipePin } = setup({ enabled: false });
    const row = rowRef.current!;
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent({}, row));
      result.current.handlers.onPointerMove(pointerEvent({ clientX: 60 }, row));
      result.current.handlers.onPointerUp(pointerEvent({ clientX: 60 }, row));
    });
    expect(result.current.swiping).toBe(false);
    expect(onSwipePin).not.toHaveBeenCalled();
  });

  it("ignores a vertical drag (scroll) rather than engaging a horizontal swipe", () => {
    const { result, rowRef, onSwipePin, onSwipeFavorite } = setup();
    const row = rowRef.current!;
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent({}, row));
      result.current.handlers.onPointerMove(
        pointerEvent({ clientX: 4, clientY: 60 }, row),
      );
      result.current.handlers.onPointerUp(
        pointerEvent({ clientX: 4, clientY: 60 }, row),
      );
    });
    expect(result.current.swiping).toBe(false);
    expect(onSwipePin).not.toHaveBeenCalled();
    expect(onSwipeFavorite).not.toHaveBeenCalled();
  });

  it("resets the drag without firing an action on pointercancel", () => {
    const { result, rowRef, onSwipePin, onSwipeFavorite } = setup();
    const row = rowRef.current!;
    act(() => {
      result.current.handlers.onPointerDown(pointerEvent({}, row));
      result.current.handlers.onPointerMove(pointerEvent({ clientX: 60 }, row));
      result.current.handlers.onPointerCancel(pointerEvent({}, row));
    });
    expect(result.current.swiping).toBe(false);
    expect(onSwipePin).not.toHaveBeenCalled();
    expect(onSwipeFavorite).not.toHaveBeenCalled();
    expect(result.current.consumeSwipeClick()).toBe(false);
  });
});
