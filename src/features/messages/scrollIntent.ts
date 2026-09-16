// src/features/messages/scrollIntent.ts

/** A scroll only counts as the member's own when they wheeled, touched,
 *  pressed a pointer or pressed a scroll key this recently. The log's own
 *  programmatic scrolls with no recent input (stick-to-bottom following a new
 *  message) therefore read as unintended. A tap inside the log also opens this
 *  window, so a jump started from a reply quote in the log can briefly count
 *  as intended; the member just acted in the log, so that is acceptable. */
const INTENT_WINDOW_MS = 800;

/** Keys the browser scrolls a focused (or body-focused) scroller with. */
const SCROLL_KEYS = new Set([
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
  "ArrowUp",
  "ArrowDown",
]);

const AREA_INTENT_EVENTS = ["wheel", "touchstart", "touchmove"] as const;

/** Space, Home, End and arrows move a caret inside a text field; they only
 *  scroll the log when pressed outside one. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export interface ScrollIntentTracker {
  /** True while a pointer is held down on the log (a scrollbar drag that
   *  paused and resumed) or when input landed within `INTENT_WINDOW_MS`. */
  hasRecentIntent: () => boolean;
  dispose: () => void;
}

/**
 * Tracks whether a scroll of `area` follows the member's own input.
 *
 * Keyboard scrolling is caught with a capture `keydown` listener on the
 * document, because after a click in the log focus usually sits on the body
 * (the log itself is not focusable), so a listener on `.area` never hears it.
 * Only keys pressed with focus on the body or inside the log count.
 *
 * A pointer press on the log (including its scrollbar) is remembered as held
 * until a release, a cancel, or the first pointer move with no buttons down,
 * so a scrollbar drag that sits still past the intent window still counts
 * when it moves again. The move listener only exists while a press is held.
 */
export function createScrollIntentTracker(
  area: HTMLElement,
): ScrollIntentTracker {
  const ownerDocument = area.ownerDocument;
  const view = ownerDocument.defaultView ?? window;
  let lastIntentAt = Number.NEGATIVE_INFINITY;
  let isPointerHeld = false;

  function markIntent() {
    lastIntentAt = performance.now();
  }

  function releasePointer() {
    isPointerHeld = false;
    view.removeEventListener("pointerup", releasePointer, true);
    view.removeEventListener("pointercancel", releasePointer, true);
    view.removeEventListener("pointermove", handlePointerMove, true);
  }

  function handlePointerMove(event: PointerEvent) {
    if (event.buttons === 0) releasePointer();
  }

  function handlePointerDown() {
    markIntent();
    if (isPointerHeld) return;
    isPointerHeld = true;
    const listenerOptions = { capture: true, passive: true };
    view.addEventListener("pointerup", releasePointer, listenerOptions);
    view.addEventListener("pointercancel", releasePointer, listenerOptions);
    view.addEventListener("pointermove", handlePointerMove, listenerOptions);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!SCROLL_KEYS.has(event.key) || isEditableTarget(event.target)) return;
    const activeElement = ownerDocument.activeElement;
    if (
      activeElement === null ||
      activeElement === ownerDocument.body ||
      area.contains(activeElement)
    ) {
      markIntent();
    }
  }

  for (const eventName of AREA_INTENT_EVENTS) {
    area.addEventListener(eventName, markIntent, { passive: true });
  }
  area.addEventListener("pointerdown", handlePointerDown, { passive: true });
  ownerDocument.addEventListener("keydown", handleKeyDown, {
    capture: true,
    passive: true,
  });

  return {
    hasRecentIntent: () =>
      isPointerHeld || performance.now() - lastIntentAt <= INTENT_WINDOW_MS,
    dispose: () => {
      for (const eventName of AREA_INTENT_EVENTS) {
        area.removeEventListener(eventName, markIntent);
      }
      area.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("keydown", handleKeyDown, true);
      releasePointer();
    },
  };
}
