import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PointerEventStub } from "../../../../../test/pointerEventStub";
import { StudioRangeSlider } from "./StudioRangeSlider";

const direction = vi.hoisted(() => ({ isRightToLeft: false }));

vi.mock("./studioRangeGeometry", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./studioRangeGeometry")>();
  return { ...original, isRightToLeft: () => direction.isRightToLeft };
});

type SliderProps = ComponentProps<typeof StudioRangeSlider>;

function renderSlider(overrides: Partial<SliderProps> = {}) {
  const onCommit = vi.fn();
  const onPreviewChange = vi.fn();
  const props: SliderProps = {
    variant: "seek",
    min: 0,
    max: 100,
    value: 20,
    commitMode: "release",
    keySteps: { arrow: 5, page: 30 },
    ariaLabel: "Seek",
    ariaValueText: "Seek position",
    onCommit,
    onPreviewChange,
    ...overrides,
  };
  const view = render(<StudioRangeSlider {...props} />);
  const input = screen.getByRole("slider");
  const root = view.container.querySelector<HTMLElement>("[data-studio-range]");
  if (!root) throw new Error("slider root missing");
  return { ...view, input, root, onCommit, onPreviewChange, props };
}

/** Lets the frame-batched drag moves land. */
async function nextFrame() {
  await act(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );
}

function press(root: HTMLElement, clientX: number, pointerType = "mouse") {
  fireEvent.pointerDown(root, {
    pointerId: 1,
    pointerType,
    clientX,
    button: 0,
  });
}

function move(root: HTMLElement, clientX: number, pointerType = "mouse") {
  fireEvent.pointerMove(root, { pointerId: 1, pointerType, clientX });
}

function release(root: HTMLElement, clientX: number, pointerType = "mouse") {
  fireEvent.pointerUp(root, { pointerId: 1, pointerType, clientX });
}

beforeEach(() => {
  direction.isRightToLeft = false;
  vi.stubGlobal("PointerEvent", PointerEventStub);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 300,
    height: 24,
    top: 0,
    left: 0,
    right: 300,
    bottom: 24,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("StudioRangeSlider", () => {
  it("commits once per drag in release mode", async () => {
    const { root, onCommit, onPreviewChange } = renderSlider();
    press(root, 30);
    expect(root).toHaveAttribute("data-dragging");
    expect(root).toHaveAttribute("data-pointer", "mouse");
    move(root, 90);
    await nextFrame();
    move(root, 150);
    await nextFrame();
    expect(onCommit).not.toHaveBeenCalled();
    expect(onPreviewChange).toHaveBeenLastCalledWith(50);
    release(root, 150);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(50);
    expect(onPreviewChange).toHaveBeenLastCalledWith(null);
    expect(root).not.toHaveAttribute("data-dragging");
  });

  it("commits on press and on every move in continuous mode", async () => {
    const { root, onCommit } = renderSlider({ commitMode: "continuous" });
    press(root, 30);
    expect(onCommit).toHaveBeenLastCalledWith(10);
    move(root, 90);
    await nextFrame();
    expect(onCommit).toHaveBeenLastCalledWith(30);
    move(root, 150);
    await nextFrame();
    expect(onCommit).toHaveBeenLastCalledWith(50);
    release(root, 150);
    expect(onCommit).toHaveBeenCalledTimes(3);
  });

  it("drops the drag on Escape and keeps the key from bubbling", async () => {
    const onWindowKeyDown = vi.fn();
    window.addEventListener("keydown", onWindowKeyDown);
    const { input, root, onCommit } = renderSlider();
    press(root, 30);
    move(root, 150);
    await nextFrame();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onWindowKeyDown).not.toHaveBeenCalled();
    expect(root).not.toHaveAttribute("data-dragging");
    release(root, 150);
    expect(onCommit).not.toHaveBeenCalled();
    // With nothing left to cancel, Escape bubbles on.
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onWindowKeyDown).toHaveBeenCalledTimes(1);
    window.removeEventListener("keydown", onWindowKeyDown);
  });

  it("commits a burst of arrow keys once after the delay", () => {
    vi.useFakeTimers();
    const { input, onCommit, onPreviewChange } = renderSlider();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    fireEvent.keyDown(input, { key: "ArrowRight" });
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(onPreviewChange).toHaveBeenLastCalledWith(35);
    expect(onCommit).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(35);
    expect(onPreviewChange).toHaveBeenLastCalledWith(null);
  });

  it("swaps the left and right arrows in right to left text", () => {
    direction.isRightToLeft = true;
    const { input, onCommit } = renderSlider({ commitMode: "continuous" });
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    expect(onCommit).toHaveBeenLastCalledWith(25);
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(onCommit).toHaveBeenLastCalledWith(15);
  });

  it("ignores keys and presses while disabled and stays focusable", () => {
    const { input, root, onCommit, onPreviewChange } = renderSlider({
      isDisabled: true,
    });
    input.focus();
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("aria-disabled", "true");
    expect(root).toHaveAttribute("data-disabled");
    fireEvent.keyDown(input, { key: "ArrowRight" });
    press(root, 150);
    release(root, 150);
    expect(onCommit).not.toHaveBeenCalled();
    expect(onPreviewChange).not.toHaveBeenCalled();
    expect(root).not.toHaveAttribute("data-dragging");
  });

  it("draws one tick per given fraction", () => {
    const { container } = renderSlider({ tickFractions: [0.25, 0.5, 0.75] });
    expect(container.querySelectorAll("[data-chapter-tick]")).toHaveLength(3);
  });

  it("keeps a press on the bar from reaching the parent", () => {
    const onParentPointerDown = vi.fn();
    render(
      <div onPointerDown={onParentPointerDown}>
        <StudioRangeSlider
          variant="volume"
          min={0}
          max={100}
          value={50}
          commitMode="continuous"
          keySteps={{ arrow: 1, page: 10 }}
          ariaLabel="Volume"
          ariaValueText="50%"
          onCommit={vi.fn()}
        />
      </div>,
    );
    const root = screen.getByRole("slider").parentElement as HTMLElement;
    press(root, 90, "touch");
    expect(onParentPointerDown).not.toHaveBeenCalled();
  });

  it("commits a move still waiting for its frame when the pointer lifts", () => {
    const { root, onCommit } = renderSlider();
    press(root, 30);
    move(root, 150);
    release(root, 150);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(50);
  });

  it("drops a drag with no commit when the reset key changes", async () => {
    const { root, onCommit, onPreviewChange, props, rerender } = renderSlider({
      interactionResetKey: "track-one",
    });
    press(root, 30);
    move(root, 150);
    await nextFrame();
    expect(onPreviewChange).toHaveBeenLastCalledWith(50);
    rerender(<StudioRangeSlider {...props} interactionResetKey="track-two" />);
    expect(onPreviewChange).toHaveBeenLastCalledWith(null);
    expect(root).not.toHaveAttribute("data-dragging");
    release(root, 150);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("drops a release mode key burst on Escape with no commit", () => {
    vi.useFakeTimers();
    const { input, onCommit, onPreviewChange } = renderSlider();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(onPreviewChange).toHaveBeenLastCalledWith(30);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onPreviewChange).toHaveBeenLastCalledWith(null);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("commits a pending key burst exactly once on unmount", () => {
    vi.useFakeTimers();
    const { input, onCommit, unmount } = renderSlider();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    fireEvent.keyDown(input, { key: "ArrowRight" });
    unmount();
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(30);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it("keeps the drag when a descendant loses pointer capture", async () => {
    const { root, input, onCommit } = renderSlider();
    press(root, 30);
    fireEvent.lostPointerCapture(input, { pointerId: 1, pointerType: "mouse" });
    expect(root).toHaveAttribute("data-dragging");
    move(root, 150);
    await nextFrame();
    release(root, 150);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(50);
  });

  it("cancels the drag when the root itself loses pointer capture", () => {
    const { root, onCommit, onPreviewChange } = renderSlider();
    press(root, 30);
    fireEvent.lostPointerCapture(root, { pointerId: 1, pointerType: "mouse" });
    expect(root).not.toHaveAttribute("data-dragging");
    expect(onPreviewChange).toHaveBeenLastCalledWith(null);
    release(root, 30);
    expect(onCommit).not.toHaveBeenCalled();
  });
});
