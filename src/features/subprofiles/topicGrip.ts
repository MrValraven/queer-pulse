import { useCallback } from "react";
import type { TopicFocus } from "./useTopicFocus";

/** What a topic or line grip's move menu needs (`SkinListGrip`'s `reorder`
 *  prop). */
export interface TopicGripReorder {
  rowLabel: string;
  /** 1-based. */
  rowNumber: number;
  rowCount: number;
  /** Moves the row to this 0-based slot. */
  onMove: (toIndex: number) => void;
}

/** Focus keys for the grips, so focus follows a row moved from its grip's
 *  menu. A topic is keyed by its uid and a line by its line key, both of
 *  which ride along with the move. */
export const topicGripFocusKeys = {
  topic: (uid: string) => `${uid}:grip`,
  line: (lineKeyId: string) => `${lineKeyId}:grip`,
} as const;

/**
 * A ref for a row that registers the grip inside it under `key` (no key
 * registers nothing). `SkinListGrip` takes no ref, so the row finds it by
 * the class it was given, and takes the button inside when the grip wraps
 * one. The callback is kept per key, so React attaches it once per row and
 * a keystroke never re-runs the lookup.
 */
export function useGripRowRef(
  register: TopicFocus["register"],
  key: string | undefined,
  /** CSS-module classes type as possibly missing; no class finds no grip. */
  gripClassName: string | undefined,
) {
  return useCallback(
    (row: HTMLElement | null) => {
      if (key === undefined) return;
      const grip = gripClassName
        ? row?.querySelector<HTMLElement>(`.${CSS.escape(gripClassName)}`)
        : undefined;
      const button = grip?.matches("button")
        ? grip
        : grip?.querySelector<HTMLElement>("button");
      register(key)(button ?? grip ?? null);
    },
    [register, key, gripClassName],
  );
}
