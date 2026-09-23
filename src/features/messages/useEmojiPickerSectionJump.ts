// src/features/messages/useEmojiPickerSectionJump.ts
import { useEffect, useRef, useState } from "react";
import type { EmojiSection } from "./emojiSections";

interface UseEmojiPickerSectionJumpArgs {
  sections: EmojiSection[];
  sectionFirstRowIndex: Record<string, number>;
  /** The scroll-spy result from `useEmojiGridVirtualizer`. */
  activeSectionKey: string | null;
  scrollToIndex: (
    rowIndex: number,
    options: { align: "start"; behavior: "auto" | "smooth" },
  ) => void;
  /** Clears whatever got the grid into its current section list before a
   *  jump is issued (the search query), the only thing "jump to a group" can
   *  sensibly mean from a flat search-result list. */
  onBeforeJump: () => void;
}

/**
 * `EmojiPicker`'s category-rail jump bookkeeping, split out purely to keep
 * that component under the line cap once the Stickers tab was added.
 * Behaviour is unchanged from before that split; see the exported values'
 * own use in `EmojiPicker` for how the rail reads `pendingSectionKey`.
 */
export function useEmojiPickerSectionJump({
  sections,
  sectionFirstRowIndex,
  activeSectionKey,
  scrollToIndex,
  onBeforeJump,
}: UseEmojiPickerSectionJumpArgs) {
  // The section a rail jump is currently sweeping toward, held separately
  // from `activeSectionKey` so the rail can show that target immediately
  // instead of waiting for the scroll-spy to catch up. A `behavior: "smooth"`
  // jump takes a few hundred ms and strobes through every section it passes
  // over on the way; pinning the rail to the target for that stretch is what
  // prevents that strobe.
  const [pendingSectionKey, setPendingSectionKey] = useState<string | null>(
    null,
  );
  const pendingSectionTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);
  // What `sections` was as of the last render, purely so the render-time
  // reset below can detect a reshape (a search starting/ending swaps the
  // whole list). Held in state rather than a ref: this codebase's
  // `react-hooks/refs` rule forbids reading or writing a ref's `current`
  // during render (only effects/handlers may touch one), so the plain
  // `useState` "previous value" comparison React's own docs use for
  // adjusting state during render is the correct tool here, a ref cannot do
  // this job under that rule.
  const [previousSections, setPreviousSections] = useState(sections);

  // Clears the pending key the moment either condition below holds, using
  // React's sanctioned "adjust state while rendering" idiom (the same shape
  // `EmojiGrid.tsx`'s own `clampedActiveRow` clamp already uses) rather than
  // a `useEffect`: a `setState` called synchronously in an effect body is
  // itself a redundant extra render pass the lint rule `set-state-in-effect`
  // flags, and both checks below are cheap enough to run on every render:
  //   1. The scroll-spy actually reached the pending section, the ordinary,
  //      happy-path resolution of a jump.
  //   2. `sections` reshaped since the jump was issued, so the row index it
  //      targeted is stale the instant that happens, so the pending
  //      highlight is dropped rather than risk pointing at a section that
  //      may not even exist in the new list.
  if (pendingSectionKey !== null && activeSectionKey === pendingSectionKey) {
    setPendingSectionKey(null);
  }
  if (sections !== previousSections) {
    setPreviousSections(sections);
    if (pendingSectionKey !== null) {
      setPendingSectionKey(null);
    }
  }

  // Safety net: a pending key must never wedge the rail on a section it can
  // never reach, e.g. the user scrolls away mid-animation, or the target
  // section is short enough that the spy skips past it as "active" without
  // ever landing exactly on it as topmost. A generous timeout (longer than
  // any realistic smooth-scroll duration) clears it unconditionally; this
  // genuinely is effect territory (it subscribes to an external timer and
  // must clean it up), unlike the two render-time resets above.
  useEffect(() => {
    if (pendingSectionKey === null) return;
    pendingSectionTimeoutRef.current = setTimeout(() => {
      setPendingSectionKey(null);
    }, 1000);
    return () => clearTimeout(pendingSectionTimeoutRef.current);
  }, [pendingSectionKey]);

  function handleSelectSection(sectionKey: string) {
    // A category tab is also the way out of a search: the grid is showing
    // one flat "results" list, and picking a group plainly means "show me
    // the groups again". The jump itself then only applies when the grid
    // already HAS that group as rows: mid-search `sectionFirstRowIndex`
    // holds nothing but "results", so the guard below returns and the clear
    // above is the whole of what the click does. Deliberately not deferred
    // until the (debounced) query catches up 250ms later: the machinery to
    // hold a jump open across that reshape costs more than it buys, since
    // clearing a search already lands the grid at the top of the category
    // list.
    onBeforeJump();
    const rowIndex = sectionFirstRowIndex[sectionKey];
    if (rowIndex === undefined) return;
    setPendingSectionKey(sectionKey);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scrollToIndex(rowIndex, {
      align: "start",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return { pendingSectionKey, handleSelectSection };
}
