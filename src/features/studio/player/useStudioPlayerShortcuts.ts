import { useEffect, useRef } from "react";
import {
  hasOpenModal,
  openModalCount,
} from "../../../shared/components/ui/modalStack";

export type StudioPlayerShortcutId =
  | "playPause"
  | "seekBack"
  | "seekForward"
  | "previousTrack"
  | "nextTrack"
  | "volumeUp"
  | "volumeDown"
  | "mute"
  | "shuffle"
  | "repeat"
  | "lyrics"
  | "queue"
  | "help";

export interface StudioPlayerShortcutHandlers {
  hasQueue: boolean;
  isNowPlayingOpen: boolean;
  onShortcut: (shortcutId: StudioPlayerShortcutId) => void;
}

type KeyPress = Pick<
  KeyboardEvent,
  "key" | "shiftKey" | "ctrlKey" | "metaKey" | "altKey"
>;

const LETTER_SHORTCUTS: Record<string, StudioPlayerShortcutId> = {
  m: "mute",
  s: "shuffle",
  r: "repeat",
  l: "lyrics",
  q: "queue",
};

const ARROW_SHORTCUTS: ReadonlySet<StudioPlayerShortcutId> = new Set([
  "seekBack",
  "seekForward",
  "previousTrack",
  "nextTrack",
  "volumeUp",
  "volumeDown",
]);

/** Held keys that keep acting: seeking and volume repeat, the rest fire once. */
const REPEATABLE_SHORTCUTS: ReadonlySet<StudioPlayerShortcutId> = new Set([
  "seekBack",
  "seekForward",
  "volumeUp",
  "volumeDown",
]);

/** Input types that hold no typed text; every other input is a text field. */
const NON_TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  "range",
  "checkbox",
  "radio",
  "button",
  "submit",
  "reset",
  "color",
  "file",
  "image",
]);

/** Controls that use the arrow keys themselves, including any region marked
 *  data-player-keys="own-arrows" (the synced lyrics scroller). */
const ARROW_OWNERS =
  'input[type="range"], input[type="radio"], [role="slider"], [role="tab"], [role="tablist"], [role="menu"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"], [role="listbox"], [role="radio"], [role="radiogroup"], [role="spinbutton"], [role="grid"], [role="tree"], [data-player-keys="own-arrows"]';

/** Controls that Space presses. */
const SPACE_OWNERS =
  'button, a[href], [role="button"], [role="link"], [role="checkbox"], [role="switch"], input[type="range"], input[type="checkbox"], input[type="radio"], input[type="button"], input[type="submit"]';

/** The spec 7.9 table; null for anything else or with Ctrl, Meta or Alt. */
export function shortcutIdOf(event: KeyPress): StudioPlayerShortcutId | null {
  if (typeof event.key !== "string") return null;
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  switch (event.key) {
    case " ":
    case "Spacebar":
      return event.shiftKey ? null : "playPause";
    case "ArrowLeft":
      return event.shiftKey ? "previousTrack" : "seekBack";
    case "ArrowRight":
      return event.shiftKey ? "nextTrack" : "seekForward";
    case "ArrowUp":
      return event.shiftKey ? null : "volumeUp";
    case "ArrowDown":
      return event.shiftKey ? null : "volumeDown";
    case "?":
      return "help";
    default:
      return LETTER_SHORTCUTS[event.key.toLowerCase()] ?? null;
  }
}

function isTextEntry(target: HTMLElement): boolean {
  if (target.isContentEditable) return true;
  if (target.closest('[contenteditable=""], [contenteditable="true"]'))
    return true;
  if (target.tagName === "TEXTAREA" || target.tagName === "SELECT") return true;
  return (
    target.tagName === "INPUT" &&
    !NON_TEXT_INPUT_TYPES.has((target as HTMLInputElement).type)
  );
}

/** Whether the focused element owns this key (C.3). Every input stands the
 *  shortcuts down (Plan 3's X2: text fields and the seek and volume sliders
 *  alike), as do textareas, selects and editable text. */
export function isShortcutBlockedByTarget(
  target: EventTarget | null,
  shortcutId: StudioPlayerShortcutId,
): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.tagName === "INPUT" || isTextEntry(target)) return true;
  if (shortcutId === "playPause") return target.closest(SPACE_OWNERS) !== null;
  if (ARROW_SHORTCUTS.has(shortcutId))
    return target.closest(ARROW_OWNERS) !== null;
  return false;
}

/** Any dialog other than Now playing stands the shortcuts down. */
export function isBlockedByModal(isNowPlayingOpen: boolean): boolean {
  if (!hasOpenModal()) return false;
  return !(isNowPlayingOpen && openModalCount() === 1);
}

/** The player's keyboard shortcuts, mounted once by StudioPlayerProvider
 *  (through StudioPlayerShortcutsMount). Active while something is queued. */
export function useStudioPlayerShortcuts(
  handlers: StudioPlayerShortcutHandlers,
): void {
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });
  const { hasQueue } = handlers;
  useEffect(() => {
    if (!hasQueue) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing) return;
      const shortcutId = shortcutIdOf(event);
      if (!shortcutId) return;
      if (isBlockedByModal(handlersRef.current.isNowPlayingOpen)) return;
      if (isShortcutBlockedByTarget(event.target, shortcutId)) return;
      event.preventDefault();
      if (event.repeat && !REPEATABLE_SHORTCUTS.has(shortcutId)) return;
      handlersRef.current.onShortcut(shortcutId);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasQueue]);
}
