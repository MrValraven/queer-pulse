import { useCallback, useLayoutEffect, useRef } from "react";

/** Where the caret goes in a text field that takes focus. */
export type TopicCaret = "start" | "end" | number;

/** Focus targets of TherapistTopicsControl, keyed by row `_uid`. */
export const topicFocusKeys = {
  heading: (uid: string) => `${uid}:heading`,
  line: (uid: string, lineIndex: number) => `${uid}:line:${lineIndex}`,
  moveUp: (uid: string) => `${uid}:move-up`,
  moveDown: (uid: string) => `${uid}:move-down`,
  addTopic: "add-topic",
} as const;

interface FocusRequest {
  /** Tried in order; the first one mounted and enabled takes focus. */
  keys: string[];
  caret: TopicCaret;
}

function placeCaret(element: HTMLElement, caret: TopicCaret) {
  const isTextField =
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLInputElement;
  if (!isTextField) return;
  const position =
    caret === "start" ? 0 : caret === "end" ? element.value.length : caret;
  element.setSelectionRange(position, position);
}

function focusFirstUsable(
  elements: Map<string, HTMLElement>,
  { keys, caret }: FocusRequest,
): boolean {
  for (const key of keys) {
    const element = elements.get(key);
    if (!element || element.matches(":disabled")) continue;
    element.focus();
    placeCaret(element, caret);
    return true;
  }
  return false;
}

/**
 * The topic control's focus registry: every heading, line, move button and
 * the "Add a topic" button registers under a key, and an edit asks for focus
 * by key. `requestFocus` waits for the re-render the edit causes (a layout
 * effect in the control, after every ref is attached), so a line created by
 * the edit can take focus the moment it exists. `focusNow` is for moves that
 * change nothing.
 */
export function useTopicFocus() {
  const elementsRef = useRef(new Map<string, HTMLElement>());
  const pendingRef = useRef<FocusRequest | null>(null);

  const register = useCallback(
    (key: string) => (element: HTMLElement | null) => {
      if (element) elementsRef.current.set(key, element);
      else elementsRef.current.delete(key);
    },
    [],
  );

  const requestFocus = useCallback(
    (keys: string[], caret: TopicCaret = "end") => {
      pendingRef.current = { keys, caret };
    },
    [],
  );

  const focusNow = useCallback(
    (keys: string[], caret: TopicCaret = "end") =>
      focusFirstUsable(elementsRef.current, { keys, caret }),
    [],
  );

  // No dependency list on purpose: a request is served by whichever render
  // commits next, and cleared either way so it never fires late.
  useLayoutEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    focusFirstUsable(elementsRef.current, pending);
  });

  return { register, requestFocus, focusNow };
}

export type TopicFocus = ReturnType<typeof useTopicFocus>;
