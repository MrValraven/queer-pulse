// src/features/messages/PickerSearchStatus.tsx
import { useEffect, useState } from "react";

/** How long the query must sit still before the result count is announced,
 *  so a screen reader hears one settled count per search and stays quiet
 *  through every keystroke on the way there. */
const STATUS_SETTLE_MS = 500;

interface PickerSearchStatusProps {
  /** The line a settled search should announce (a result count, or a "no
   *  results" line); empty while nothing is searched. Recomputed on every
   *  render, but only actually announced once it has sat still through the
   *  settle wait below. */
  text: string;
  /** Restarts the settle wait on every change, even one that leaves `text`
   *  itself unchanged, so the line lands once per settled query, right after
   *  typing has paused. */
  settleKey: string;
}

/**
 * A polite `aria-live` status line for a picker's search field, passed into
 * `PickerSearchField`'s `children` slot. Shared by the sticker tab
 * (`StickerSearchField`) and the emoji tab (`EmojiPicker`) so a screen
 * reader hears one settled result count per search in either.
 *
 * Stays mounted the whole time (rendering an empty string while nothing is
 * searched), so a screen reader already knows the region before the first
 * count ever arrives.
 */
export function PickerSearchStatus({
  text,
  settleKey,
}: PickerSearchStatusProps) {
  const [settledText, setSettledText] = useState("");
  useEffect(() => {
    const settleTimer = window.setTimeout(
      () => setSettledText(text),
      STATUS_SETTLE_MS,
    );
    return () => window.clearTimeout(settleTimer);
    // `settleKey` restarts the wait on every keystroke, even one that leaves
    // `text` unchanged, so the line lands once typing pauses.
  }, [text, settleKey]);

  return (
    <p className="visuallyHidden" role="status" aria-live="polite">
      {settledText}
    </p>
  );
}
