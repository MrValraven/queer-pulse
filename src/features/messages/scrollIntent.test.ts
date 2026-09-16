import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createScrollIntentTracker,
  type ScrollIntentTracker,
} from "./scrollIntent";

/**
 * `hasRecentIntent()` feeds the floating day pill's reveal gate
 * (`useFloatingDayHeader.ts`'s `handleScroll`): a scroll only REVEALS the
 * pill when it follows the member's own input (wheel, touch, a held pointer,
 * or a scroll key with focus outside an editable field); once shown, any
 * scroll, including a programmatic one, keeps it alive. This tracker plays
 * no part in stick-to-bottom detachment, which lives entirely in
 * `useMessageScroll.ts`'s own `handleAreaScroll` and is covered in
 * `useMessageScroll.stickToBottom.test.ts` instead. A mutable fake clock
 * replaces `performance.now()` so the decay window (`INTENT_WINDOW_MS`) is
 * deterministic without a real 800ms wait.
 */

let now = 0;

beforeEach(() => {
  now = 0;
  vi.spyOn(performance, "now").mockImplementation(() => now);
});

afterEach(() => {
  vi.restoreAllMocks();
  // `setup()` appends nodes straight to `document.body`; the DOM otherwise
  // persists across `it`s in this file.
  document.body.replaceChildren();
});

function setup(): { area: HTMLDivElement; tracker: ScrollIntentTracker } {
  const area = document.createElement("div");
  document.body.appendChild(area);
  const tracker = createScrollIntentTracker(area);
  return { area, tracker };
}

describe("createScrollIntentTracker", () => {
  it("marks intent on a real wheel event over the log", () => {
    const { area, tracker } = setup();
    expect(tracker.hasRecentIntent()).toBe(false);

    area.dispatchEvent(new Event("wheel", { bubbles: true }));

    expect(tracker.hasRecentIntent()).toBe(true);
    tracker.dispose();
  });

  it("never marks intent from a plain scroll event, only from the real input that causes one", () => {
    const { area, tracker } = setup();

    area.dispatchEvent(new Event("scroll", { bubbles: true }));

    expect(tracker.hasRecentIntent()).toBe(false);
    tracker.dispose();
  });

  it("decays after the intent window, so a scroll well after the last real input reads as unintended", () => {
    const { area, tracker } = setup();
    area.dispatchEvent(new Event("wheel", { bubbles: true }));
    expect(tracker.hasRecentIntent()).toBe(true);

    now += 801; // just past INTENT_WINDOW_MS (800ms)

    expect(tracker.hasRecentIntent()).toBe(false);
    tracker.dispose();
  });

  it("marks intent on a scroll key pressed with focus on the body, ignores one typed into a field", () => {
    const { area, tracker } = setup();
    const input = document.createElement("input");
    document.body.appendChild(input);

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    expect(tracker.hasRecentIntent()).toBe(false);

    area.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    expect(tracker.hasRecentIntent()).toBe(true);

    tracker.dispose();
    document.body.removeChild(input);
  });

  it("keeps intent true for a held pointer (a paused scrollbar drag) past the decay window, until it releases", () => {
    // jsdom has no native PointerEvent constructor (unlike KeyboardEvent/
    // MouseEvent), and `addEventListener`/`dispatchEvent` match purely on the
    // event's `type` string: a plain `Event` dispatched as "pointerdown" is
    // indistinguishable from a real one to this tracker, which never reads a
    // pointer-specific field off the down/up events anyway.
    const { area, tracker } = setup();
    area.dispatchEvent(new Event("pointerdown", { bubbles: true }));

    now += 2000; // well past the decay window, still held
    expect(tracker.hasRecentIntent()).toBe(true);

    window.dispatchEvent(new Event("pointerup"));
    // Released with no fresh input since: now reads as decayed.
    expect(tracker.hasRecentIntent()).toBe(false);
    tracker.dispose();
  });

  it("releases a held pointer on the first move with no buttons down (a lost pointerup)", () => {
    const { area, tracker } = setup();
    area.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    now += 2000;
    expect(tracker.hasRecentIntent()).toBe(true);

    const move = new Event("pointermove");
    Object.defineProperty(move, "buttons", { value: 0 });
    window.dispatchEvent(move);

    expect(tracker.hasRecentIntent()).toBe(false);
    tracker.dispose();
  });

  it("dispose() removes every listener, so a later wheel event no longer marks intent", () => {
    const { area, tracker } = setup();
    tracker.dispose();

    area.dispatchEvent(new Event("wheel", { bubbles: true }));

    expect(tracker.hasRecentIntent()).toBe(false);
  });
});
