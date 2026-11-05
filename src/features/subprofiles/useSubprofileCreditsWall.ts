import { useMemo, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import {
  selectWallTiles,
  type WallTileView,
} from "./api/directoryCard.adapters";
import { useSubprofileWall } from "./api/useSubprofileWall";
import {
  WALL_LAYOUT_DESKTOP_NINE,
  WALL_LAYOUT_DESKTOP_SIX,
  WALL_LAYOUT_PHONE_SIX,
  WALL_MIN_TILES,
  type WallLayout,
} from "./subprofileCreditsWall.data";

/** What the wall draws: skeleton tiles while the wall loads, the tiles
 *  once it lands, or nothing (under three personas, or no data at all). */
export type CreditsWallState =
  | { status: "loading"; layout: WallLayout }
  | { status: "ready"; layout: WallLayout; tiles: WallTileView[] }
  | { status: "hidden" };

/** The wall's tiles as first chosen, and the mode they were chosen in. */
interface LatchedWall {
  isDemoMode: boolean;
  tiles: WallTileView[];
}

/** The most tiles any layout draws. The selection is latched at this size
 *  whatever the width, so a phone turned to landscape has its nine ready. */
export const MAX_WALL_TILES = WALL_LAYOUT_DESKTOP_NINE.spans.length;

/** The largest wall that the available personas fill as a full rectangle:
 *  nine on desktop, else six, else the three-tile wall. The admin preview
 *  draws its wall with this same choice. */
export function wallLayoutFor(tileCount: number, isPhone: boolean): WallLayout {
  const sixTiles = isPhone ? WALL_LAYOUT_PHONE_SIX : WALL_LAYOUT_DESKTOP_SIX;
  if (!isPhone && tileCount >= WALL_LAYOUT_DESKTOP_NINE.spans.length) {
    return WALL_LAYOUT_DESKTOP_NINE;
  }
  if (tileCount >= sixTiles.spans.length) return sixTiles;
  return { columns: 3, spans: sixTiles.spans.slice(0, WALL_MIN_TILES) };
}

/**
 * The hero's wall of faces. It reads the curated wall endpoint
 * (`GET /subprofiles/wall`, or the demo persona wall store), and keeps the
 * server's order as it comes: the admin's picks first, then the fill.
 *
 * The faces are LATCHED once three or more are in: a refetch, or an admin
 * reordering or changing the picks in another tab, rewrites the cached wall,
 * and none of that should swap the faces under the member's eye. Tiles carry
 * no follow state, so a latched tile never goes stale on screen. A demo or
 * live switch chooses afresh.
 */
export function useSubprofileCreditsWall(): CreditsWallState {
  const isPhone = useMediaQuery(mediaMax("lg"));
  const { demoMode } = useDemoMode();
  const { cards, isLoading, isShowingPreviousResults } = useSubprofileWall();
  const freshTiles = useMemo(
    () => selectWallTiles(cards, MAX_WALL_TILES),
    [cards],
  );

  const [latched, setLatched] = useState<LatchedWall | null>(null);
  const hasCurrentLatch = latched !== null && latched.isDemoMode === demoMode;
  // After a demo or live switch, keepPreviousData hands back the OTHER
  // mode's cards as placeholder with isLoading false. Those must never be
  // latched or shown, so the wall waits on the skeleton for the new mode.
  const isWaitingForCurrentMode = !hasCurrentLatch && isShowingPreviousResults;
  if (
    !isShowingPreviousResults &&
    !hasCurrentLatch &&
    freshTiles.length >= WALL_MIN_TILES
  ) {
    // Set during render (React's "adjust state on a change" pattern): the
    // re-render happens before paint, with no effect and no flash.
    setLatched({ isDemoMode: demoMode, tiles: freshTiles });
  }
  const tiles = hasCurrentLatch ? latched.tiles : freshTiles;

  if ((isLoading && !hasCurrentLatch) || isWaitingForCurrentMode) {
    return {
      status: "loading",
      layout: isPhone ? WALL_LAYOUT_PHONE_SIX : WALL_LAYOUT_DESKTOP_NINE,
    };
  }
  if (tiles.length < WALL_MIN_TILES) return { status: "hidden" };
  const layout = wallLayoutFor(tiles.length, isPhone);
  return {
    status: "ready",
    layout,
    tiles: tiles.slice(0, layout.spans.length),
  };
}
