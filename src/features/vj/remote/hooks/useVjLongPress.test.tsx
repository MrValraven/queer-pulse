import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PointerEventStub } from "../../../../test/pointerEventStub";
import { useVjLongPress, type UseVjLongPressOptions } from "./useVjLongPress";

function TestTile(props: UseVjLongPressOptions) {
  const { handlers, isLongPressing, consumeClick } = useVjLongPress(props);
  const [lastConsumed, setLastConsumed] = useState("none");
  return (
    <>
      <div data-testid="tile" data-long-pressing={isLongPressing} {...handlers}>
        Clip
      </div>
      <button
        type="button"
        data-consumed={lastConsumed}
        onClick={() => setLastConsumed(String(consumeClick()))}
      >
        Play clip
      </button>
    </>
  );
}

function renderTile(overrides: Partial<UseVjLongPressOptions> = {}) {
  const onLongPressStart = vi.fn<() => void>();
  const onLongPressEnd = vi.fn<() => void>();
  const view = render(
    <TestTile
      isEnabled
      onLongPressStart={onLongPressStart}
      onLongPressEnd={onLongPressEnd}
      {...overrides}
    />,
  );
  return {
    ...view,
    tile: view.getByTestId("tile"),
    clickTile: () => {
      const playButton = view.getByRole("button", { name: "Play clip" });
      fireEvent.click(playButton);
      return playButton.dataset.consumed;
    },
    onLongPressStart,
    onLongPressEnd,
  };
}

const touch = { pointerId: 3, pointerType: "touch", button: 0 } as const;

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("PointerEvent", PointerEventStub);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useVjLongPress", () => {
  it("fires after 450 ms", () => {
    const { tile, onLongPressStart, onLongPressEnd } = renderTile();
    fireEvent.pointerDown(tile, touch);
    advance(449);
    expect(onLongPressStart).not.toHaveBeenCalled();
    advance(1);
    expect(onLongPressStart).toHaveBeenCalledOnce();
    expect(tile.dataset.longPressing).toBe("true");
    fireEvent.pointerUp(tile, touch);
    expect(onLongPressEnd).toHaveBeenCalledOnce();
    expect(tile.dataset.longPressing).toBe("false");
  });

  it("movement cancels", () => {
    const { tile, onLongPressStart } = renderTile();
    fireEvent.pointerDown(tile, { ...touch, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(tile, { ...touch, clientX: 12, clientY: 0 });
    advance(600);
    expect(onLongPressStart).not.toHaveBeenCalled();
  });

  it("movement inside the tolerance keeps the hold", () => {
    const { tile, onLongPressStart } = renderTile();
    fireEvent.pointerDown(tile, { ...touch, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(tile, { ...touch, clientX: 6, clientY: 6 });
    advance(450);
    expect(onLongPressStart).toHaveBeenCalledOnce();
  });

  it("a short press fires nothing and leaves the click alone", () => {
    const { tile, clickTile, onLongPressStart, onLongPressEnd } = renderTile();
    fireEvent.pointerDown(tile, touch);
    advance(200);
    fireEvent.pointerUp(tile, touch);
    expect(onLongPressStart).not.toHaveBeenCalled();
    expect(onLongPressEnd).not.toHaveBeenCalled();
    expect(clickTile()).toBe("false");
  });

  it("consumeClick swallows exactly one click", () => {
    const { tile, clickTile } = renderTile();
    fireEvent.pointerDown(tile, touch);
    advance(450);
    fireEvent.pointerUp(tile, touch);
    expect(clickTile()).toBe("true");
    expect(clickTile()).toBe("false");
  });

  it("the pointer leaving ends the long press", () => {
    const { tile, onLongPressEnd } = renderTile();
    fireEvent.pointerDown(tile, touch);
    advance(450);
    fireEvent.pointerLeave(tile, touch);
    expect(onLongPressEnd).toHaveBeenCalledOnce();
  });

  it("honours a custom delay", () => {
    const { tile, onLongPressStart } = renderTile({ delayMs: 300 });
    fireEvent.pointerDown(tile, touch);
    advance(300);
    expect(onLongPressStart).toHaveBeenCalledOnce();
  });

  it("disabled fires nothing", () => {
    const { tile, onLongPressStart } = renderTile({ isEnabled: false });
    fireEvent.pointerDown(tile, touch);
    advance(600);
    expect(onLongPressStart).not.toHaveBeenCalled();
  });

  it("clears its timer on unmount", () => {
    const { tile, onLongPressStart, unmount } = renderTile();
    fireEvent.pointerDown(tile, touch);
    unmount();
    advance(600);
    expect(onLongPressStart).not.toHaveBeenCalled();
  });
});
