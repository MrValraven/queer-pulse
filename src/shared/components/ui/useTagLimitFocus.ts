import { useLayoutEffect, useRef } from "react";

/**
 * `TagPicker`'s focus handoff at the limit. When an add from inside the
 * picker (the input or a quick-add chip) fills the set, the control that had
 * focus leaves, so focus moves onto the "full" message, or onto the last
 * chip's × when there is no message to read.
 *
 * Only an add that can actually reach the limit sets the flag, so an add from
 * outside the picker (a modal's own browse list, say) that later fills the
 * set does not steal focus. One event can add several tags (a pasted
 * "a,b,c"), and every one of them sees the same `tagCount`, so adds are
 * counted until the next commit.
 */
export function useTagLimitFocus({
  tagCount,
  limit,
  hasFullLabel,
  onAdd,
}: {
  tagCount: number;
  limit?: number;
  hasFullLabel: boolean;
  onAdd: (tag: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLSpanElement>(null);
  const shouldFocusFullRef = useRef(false);
  const pendingAddCountRef = useRef(0);
  const isAtLimit = limit !== undefined && tagCount >= limit;

  function add(tag: string) {
    pendingAddCountRef.current += 1;
    const canFill =
      limit !== undefined && tagCount + pendingAddCountRef.current >= limit;
    if (
      canFill &&
      (rootRef.current?.contains(document.activeElement) ?? false)
    ) {
      shouldFocusFullRef.current = true;
    }
    onAdd(tag);
  }

  // Runs after every render (no dependency list), so the flag and the add
  // count clear on every commit, including a commit where `isAtLimit` stays
  // the same.
  useLayoutEffect(() => {
    if (isAtLimit && shouldFocusFullRef.current) {
      if (hasFullLabel) {
        fullRef.current?.focus();
      } else {
        // An empty span would be a silent focus target, so focus the last
        // chip's × here.
        const removeButtons =
          rootRef.current?.querySelectorAll<HTMLElement>("[data-chip-remove]");
        removeButtons?.[removeButtons.length - 1]?.focus();
      }
    }
    shouldFocusFullRef.current = false;
    pendingAddCountRef.current = 0;
  });

  return { rootRef, fullRef, isAtLimit, add };
}
