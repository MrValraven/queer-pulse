import { useEffect, useState } from "react";

/**
 * How long a freshly mounted tab is still fading in, in milliseconds: the
 * page's `FadeIn` on first load (60ms delay, then the fade), or the tab
 * panel's `ViewFade` on a tab switch (60ms delay and 220ms of fade). The tab
 * panel holds its height for the same span.
 */
export const CULTURAL_TAB_ENTRANCE_MS = 320;

/** The key the view carries from mount until its kind first changes after
 *  the entrance. */
const ENTRANCE_VIEW_KEY = "entrance";

/**
 * The `ViewFade` key for a tab's list view, so the tab reveals once.
 *
 * A tab mounts inside a fade that is already running (the page's entrance,
 * or the tab panel's crossfade). When the data lands during that fade, the
 * loading view becomes the list in place, under the one fade on screen, so
 * the cards never fade in a second time. Once the entrance is over, each
 * change of view kind (loading, error, empty, list) gets its own key and
 * crossfades as usual. A filter change that keeps the kind keeps the key, so
 * the list stays mounted and its cards enter and leave one by one.
 */
export function useEntranceViewKey<ViewKind extends string>(
  viewKind: ViewKind,
): string {
  const [isEntranceOver, setIsEntranceOver] = useState(false);
  const [entranceViewKind, setEntranceViewKind] = useState<ViewKind | null>(
    null,
  );

  useEffect(() => {
    const timerId = window.setTimeout(
      () => setIsEntranceOver(true),
      CULTURAL_TAB_ENTRANCE_MS,
    );
    return () => window.clearTimeout(timerId);
  }, []);

  // The kind on screen when the entrance ends keeps the entrance key, so the
  // end of the entrance itself never swaps the view.
  if (isEntranceOver && entranceViewKind === null)
    setEntranceViewKind(viewKind);

  const isEntranceView =
    !isEntranceOver ||
    entranceViewKind === null ||
    viewKind === entranceViewKind;
  return isEntranceView ? ENTRANCE_VIEW_KEY : viewKind;
}
