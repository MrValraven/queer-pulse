/**
 * Keyboard layer for the pitch triage overlay: y answers "maybe", n opens the
 * pass flow, and the left and right arrows move between pitches. It only acts
 * while focus sits inside the overlay's own dialog, so a pass or commission
 * dialog opened on top (or any text field) keeps its keys to itself.
 */

import { useEffect, useRef, type RefObject } from "react";

/** The letters the overlay answers to, shown uppercase on its key hints. */
export const TRIAGE_SHORTCUT_KEYS = { maybe: "y", pass: "n" } as const;

export interface UsePitchTriageKeysParams {
  /** Off in list mode and once every pitch is answered. */
  isEnabled: boolean;
  /** Any element inside the overlay; its dialog bounds where keys count. */
  scopeRef: RefObject<HTMLElement | null>;
  onMaybe: () => void;
  onPass: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const EDITABLE_TARGET_TAG_NAMES = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isEditableEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (EDITABLE_TARGET_TAG_NAMES.has(target.tagName)) return true;
  return target.isContentEditable;
}

export function usePitchTriageKeys({
  isEnabled,
  scopeRef,
  onMaybe,
  onPass,
  onPrevious,
  onNext,
}: UsePitchTriageKeysParams): void {
  // Latest-callback ref, so the listener binds once per enable instead of on
  // every render of the overlay.
  const handlersRef = useRef({ onMaybe, onPass, onPrevious, onNext });
  useEffect(() => {
    handlersRef.current = { onMaybe, onPass, onPrevious, onNext };
  });

  useEffect(() => {
    if (!isEnabled) return undefined;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableEventTarget(event.target)) return;
      const dialog = scopeRef.current?.closest('[role="dialog"]');
      if (!dialog || !(event.target instanceof Node)) return;
      if (!dialog.contains(event.target)) return;

      const handlers = handlersRef.current;
      const key = event.key.toLowerCase();
      if (key === TRIAGE_SHORTCUT_KEYS.maybe && !event.repeat) {
        handlers.onMaybe();
      } else if (key === TRIAGE_SHORTCUT_KEYS.pass && !event.repeat) {
        handlers.onPass();
      } else if (event.key === "ArrowLeft") {
        handlers.onPrevious();
      } else if (event.key === "ArrowRight") {
        handlers.onNext();
      } else {
        return;
      }
      event.preventDefault();
      // The desk's own y/n shortcuts listen on window; stopping here keeps one
      // key press from answering two pitches if that layer is still enabled.
      event.stopPropagation();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, scopeRef]);
}
