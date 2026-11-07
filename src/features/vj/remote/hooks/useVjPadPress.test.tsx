import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PointerEventStub } from "../../../../test/pointerEventStub";
import type { VjPadPressResult } from "../rules/vjPadPress";
import { useVjPadPress, type UseVjPadPressOptions } from "./useVjPadPress";

function TestPad(props: UseVjPadPressOptions) {
  const { handlers, isPressed } = useVjPadPress(props);
  return (
    <button type="button" data-pressed={isPressed} {...handlers}>
      Invert
    </button>
  );
}

function renderPad(overrides: Partial<UseVjPadPressOptions> = {}) {
  const onSend = vi.fn<(send: "on" | "off") => void>();
  const onOpenTuner = vi.fn<() => void>();
  const onResult = vi.fn<(result: VjPadPressResult) => void>();
  const view = render(
    <TestPad
      isOn={false}
      isBlocked={false}
      onSend={onSend}
      onOpenTuner={onOpenTuner}
      onResult={onResult}
      {...overrides}
    />,
  );
  const pad = view.getByRole("button");
  return { ...view, pad, onSend, onOpenTuner, onResult };
}

const mouse = { pointerId: 1, pointerType: "mouse", button: 0 } as const;
const touch = { pointerId: 2, pointerType: "touch", button: 0 } as const;

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

describe("useVjPadPress", () => {
  it("mouse press sends on at once", () => {
    const { pad, onSend } = renderPad();
    fireEvent.pointerDown(pad, mouse);
    expect(onSend).toHaveBeenCalledExactlyOnceWith("on");
    expect(pad.dataset.pressed).toBe("true");
  });

  it("a short mouse press latches and sends nothing on release", () => {
    const { pad, onSend, onResult } = renderPad();
    fireEvent.pointerDown(pad, mouse);
    advance(100);
    fireEvent.pointerUp(pad, mouse);
    expect(onSend.mock.calls).toEqual([["on"]]);
    expect(onResult).toHaveBeenCalledWith("latched");
    expect(pad.dataset.pressed).toBe("false");
  });

  it("touch press waits 40 ms and a scroll cancels it with nothing sent", () => {
    const { pad, onSend, onResult } = renderPad();
    fireEvent.pointerDown(pad, { ...touch, clientX: 10, clientY: 10 });
    advance(20);
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.pointerMove(pad, { ...touch, clientX: 30, clientY: 10 });
    advance(100);
    fireEvent.pointerUp(pad, touch);
    expect(onSend).not.toHaveBeenCalled();
    expect(onResult).toHaveBeenCalledExactlyOnceWith("cancelled");
  });

  it("touch press sends on once the 40 ms window passes", () => {
    const { pad, onSend } = renderPad();
    fireEvent.pointerDown(pad, touch);
    advance(39);
    expect(onSend).not.toHaveBeenCalled();
    advance(1);
    expect(onSend).toHaveBeenCalledExactlyOnceWith("on");
  });

  it("a touch tap shorter than the window still latches", () => {
    const { pad, onSend, onResult } = renderPad();
    fireEvent.pointerDown(pad, touch);
    advance(20);
    fireEvent.pointerUp(pad, touch);
    expect(onSend.mock.calls).toEqual([["on"]]);
    expect(onResult).toHaveBeenCalledWith("latched");
  });

  it("a release after 300 ms sends off", () => {
    const { pad, onSend, onResult } = renderPad();
    fireEvent.pointerDown(pad, mouse);
    advance(300);
    fireEvent.pointerUp(pad, mouse);
    expect(onSend.mock.calls).toEqual([["on"], ["off"]]);
    expect(onResult).toHaveBeenCalledWith("momentaryEnded");
  });

  it("a cancel after the on sends off", () => {
    const { pad, onSend, onResult } = renderPad();
    fireEvent.pointerDown(pad, touch);
    advance(60);
    fireEvent.pointerCancel(pad, touch);
    expect(onSend.mock.calls).toEqual([["on"], ["off"]]);
    expect(onResult).toHaveBeenCalledWith("cancelled");
  });

  it("a short press on a latched pad sends off", () => {
    const { pad, onSend, onOpenTuner, onResult } = renderPad({ isOn: true });
    fireEvent.pointerDown(pad, mouse);
    expect(onSend).not.toHaveBeenCalled();
    advance(200);
    fireEvent.pointerUp(pad, mouse);
    expect(onSend.mock.calls).toEqual([["off"]]);
    expect(onOpenTuner).not.toHaveBeenCalled();
    expect(onResult).toHaveBeenCalledWith("unlatched");
  });

  it("a latched pad held 500 ms opens the tuner", () => {
    const { pad, onSend, onOpenTuner, onResult } = renderPad({ isOn: true });
    fireEvent.pointerDown(pad, mouse);
    advance(499);
    expect(onOpenTuner).not.toHaveBeenCalled();
    advance(1);
    expect(onOpenTuner).toHaveBeenCalledOnce();
    fireEvent.pointerUp(pad, mouse);
    expect(onSend).not.toHaveBeenCalled();
    expect(onResult).toHaveBeenCalledWith("tuned");
  });

  it("a latched pad with no tuner held 500 ms sends off on release", () => {
    const { pad, onSend, onOpenTuner, onResult } = renderPad({
      isOn: true,
      isTunable: false,
    });
    fireEvent.pointerDown(pad, mouse);
    advance(500);
    expect(onOpenTuner).not.toHaveBeenCalled();
    fireEvent.pointerUp(pad, mouse);
    expect(onSend.mock.calls).toEqual([["off"]]);
    expect(onResult).toHaveBeenCalledWith("unlatched");
  });

  it("a latched touch pad with no tuner held 500 ms sends off on release", () => {
    const { pad, onSend, onOpenTuner } = renderPad({
      isOn: true,
      isTunable: false,
    });
    fireEvent.pointerDown(pad, touch);
    advance(600);
    fireEvent.pointerUp(pad, touch);
    expect(onOpenTuner).not.toHaveBeenCalled();
    expect(onSend.mock.calls).toEqual([["off"]]);
  });

  it("moving a latched pad clears the tune hold", () => {
    const { pad, onOpenTuner } = renderPad({ isOn: true });
    fireEvent.pointerDown(pad, { ...mouse, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(pad, { ...mouse, clientX: 0, clientY: 20 });
    advance(600);
    expect(onOpenTuner).not.toHaveBeenCalled();
  });

  it("keyboard click toggles", () => {
    const off = renderPad();
    fireEvent.click(off.pad, { detail: 0 });
    expect(off.onSend).toHaveBeenCalledExactlyOnceWith("on");
    off.unmount();

    const on = renderPad({ isOn: true });
    fireEvent.click(on.pad, { detail: 0 });
    expect(on.onSend).toHaveBeenCalledExactlyOnceWith("off");
  });

  it("a pointer click leaves the send to the pointer handlers", () => {
    const { pad, onSend } = renderPad();
    fireEvent.click(pad, { detail: 1 });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("context menu opens the tuner", () => {
    const { pad, onOpenTuner } = renderPad();
    const isNotPrevented = fireEvent.contextMenu(pad);
    expect(isNotPrevented).toBe(false);
    expect(onOpenTuner).toHaveBeenCalledOnce();
  });

  it("a blocked pad sends nothing", () => {
    const { pad, onSend, onOpenTuner } = renderPad({ isBlocked: true });
    fireEvent.pointerDown(pad, mouse);
    fireEvent.pointerUp(pad, mouse);
    fireEvent.click(pad, { detail: 0 });
    fireEvent.contextMenu(pad);
    expect(onSend).not.toHaveBeenCalled();
    expect(onOpenTuner).not.toHaveBeenCalled();
  });

  it("clears its timers on unmount", () => {
    const { pad, onSend, unmount } = renderPad();
    fireEvent.pointerDown(pad, touch);
    unmount();
    advance(100);
    expect(onSend).not.toHaveBeenCalled();
  });
});
