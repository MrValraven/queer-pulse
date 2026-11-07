/**
 * The failed clips of the shown pack and the sheet that explains them. The
 * sheet takes the remote's one sheet slot ("failures"), and remembers the
 * clip whose badge opened it so the sheet can land on that clip's row.
 *
 * The opener can go while the sheet is up: the clip's badge leaves once a
 * screen recovers the clip, and "See why" leaves once every clip is back.
 * Closing then sends focus to the grid's tab stop, as the grid's own search
 * does on Escape. While the opener is still there, the sheet's dialog hands
 * focus back to it as usual.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  VjClipDTO,
  VjScreenStatus,
} from "../../../../shared/contracts/vj";
import { vjClipReadinessOf } from "../../live/vjScreensSummary";
import { VJ_GRID_ITEM_ATTRIBUTE } from "../grid/useVjGridFocus";
import type { VjRemoteSheets } from "../page/useVjRemoteSheets";
import { vjFailedClipsOf, type VjFailedClip } from "./vjClipFailures";

/** The grid's one tab stop: the tile the arrow keys last moved to. */
const VJ_GRID_TAB_STOP_SELECTOR = `[data-vj-remote-grid] [${VJ_GRID_ITEM_ATTRIBUTE}][tabindex="0"]`;

/** True when the dialog's own hand-back can no longer reach the opener. */
function isVjOpenerGone(opener: HTMLElement): boolean {
  return !opener.isConnected || opener.closest("[inert]") !== null;
}

/** The control that had focus as the sheet opened; null when nothing did. */
function vjFocusedControl(): HTMLElement | null {
  const focused = document.activeElement;
  return focused instanceof HTMLElement && focused !== document.body
    ? focused
    : null;
}

export interface VjClipFailures {
  failedClips: readonly VjFailedClip[];
  isSheetOpen: boolean;
  /** The clip whose badge opened the sheet; null when "See why" opened it. */
  focusClipId: string | null;
  showFailures: (clipId: string | null) => void;
  closeFailures: () => void;
}

export function useVjClipFailures({
  clips,
  screens,
  activePackId,
  sheets,
}: {
  clips: readonly VjClipDTO[];
  screens: readonly VjScreenStatus[];
  activePackId: string | null;
  sheets: VjRemoteSheets;
}): VjClipFailures {
  const [focusClipId, setFocusClipId] = useState<string | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const { openSheet, open, close } = sheets;
  const failedClips = useMemo(
    () =>
      vjFailedClipsOf(clips, (clipId) =>
        vjClipReadinessOf(screens, activePackId ?? "", clipId),
      ),
    [clips, screens, activePackId],
  );
  const showFailures = useCallback(
    (clipId: string | null) => {
      openerRef.current = vjFocusedControl();
      setFocusClipId(clipId);
      open("failures");
    },
    [open],
  );
  // Focus moves before the close, so the closing dialog finds it outside
  // and leaves it there; a present opener gets the dialog's hand-back.
  const closeFailures = useCallback(() => {
    const opener = openerRef.current;
    openerRef.current = null;
    if (opener !== null && isVjOpenerGone(opener)) {
      document
        .querySelector<HTMLElement>(VJ_GRID_TAB_STOP_SELECTOR)
        ?.focus({ preventScroll: true });
    }
    close();
  }, [close]);
  const isSheetOpen = openSheet === "failures";
  return useMemo(
    () => ({
      failedClips,
      isSheetOpen,
      focusClipId,
      showFailures,
      closeFailures,
    }),
    [failedClips, isSheetOpen, focusClipId, showFailures, closeFailures],
  );
}
