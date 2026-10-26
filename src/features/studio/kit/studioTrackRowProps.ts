import type { DragEvent, ReactNode, Ref } from "react";
import type { StudioMenuItem } from "./StudioMenu";
import type {
  StudioTrackRowAction,
  StudioTrackRowHeadingLevel,
  StudioTrackRowLikeOptions,
} from "./StudioTrackRowParts";
import type { StudioTrackSummary } from "./studioTrackRow.types";
import type { StudioRowSelection } from "./useStudioRowSelection";

/** A row that takes drops (a playlist's reorder target). */
export interface StudioTrackRowDropTarget {
  onDragOver: (event: DragEvent<HTMLLIElement>) => void;
  onDrop: (event: DragEvent<HTMLLIElement>) => void;
}

/** The row is memoised and compares every prop by identity. Keep these
 *  stable across renders (useCallback, useMemo, or values hoisted out of
 *  the map), or each one re-renders its row on every list render:
 *  `onPlay`, `extraActions`, `menuExtraItems`, `details`, `leading`,
 *  `trailing`, `likeOptions`, `dropTarget` and `rowRef`. */
export interface StudioTrackRowProps {
  track: StudioTrackSummary;
  /** The row's 0-based place in its list; the row shows `index + 1`.
   *  Without it the row shows the track's position on its release. */
  index?: number;
  showCover?: boolean;
  showRelease?: boolean;
  showArtist?: boolean;
  isCurrent?: boolean;
  isPlaying?: boolean;
  /** Play, or pause the current row: the caller owns the toggle. */
  onPlay: () => void;
  /** The list's selection. The row compares it by this row's state only,
   *  so picking one row re-renders that row and not the other 399. */
  selection?: StudioRowSelection;
  /** The id this row holds in `selection`; defaults to the track id. A
   *  playlist passes its entry id, since one track can sit there twice. */
  selectionId?: string;
  /** Controls placed before Add to playlist (a playlist's move and remove). */
  extraActions?: ReactNode;
  /** Items the row's own track menu ("...", right-click, long-press) adds
   *  after a separator: a playlist editor's Move up, Move down, Remove. */
  menuExtraItems?: StudioMenuItem[];
  /** A cell before the number (a playlist's drag handle). */
  leading?: ReactNode;
  headingLevel?: StudioTrackRowHeadingLevel;
  /** A column between the title and the actions (an episode's progress). */
  trailing?: ReactNode;
  /** Lines under the artist (who added it to a collaborative playlist). */
  details?: ReactNode;
  /** Drag the row onto a rail playlist or the queue (fine pointers only). */
  isDraggable?: boolean;
  dropTarget?: StudioTrackRowDropTarget;
  /** The release streams nothing (taken down): play stays inert. */
  isPlayBlocked?: boolean;
  /** The viewer owns the release, so a withheld track keeps its full row. */
  isOwnerView?: boolean;
  hiddenActions?: readonly StudioTrackRowAction[];
  likeOptions?: StudioTrackRowLikeOptions;
  /** Glide to a new place on a reorder or removal. Off by default: a long
   *  list that never reorders should not measure every row. */
  isLayoutAnimated?: boolean;
  /** The member's "Hide explicit tracks", read once by the list. Without it
   *  each row reads the setting itself. */
  shouldHideExplicit?: boolean;
  rowRef?: Ref<HTMLLIElement>;
  className?: string;
}

/** `memo` comparison: every prop by identity, except the selection, which
 *  counts only where this row's state or the selection's callbacks move. */
export function areTrackRowPropsEqual(
  previous: StudioTrackRowProps,
  next: StudioTrackRowProps,
): boolean {
  const keys = new Set([...Object.keys(previous), ...Object.keys(next)]) as Set<
    keyof StudioTrackRowProps
  >;
  for (const key of keys) {
    if (key === "selection") continue;
    if (previous[key] !== next[key]) return false;
  }
  const before = previous.selection;
  const after = next.selection;
  if (before === after) return true;
  if (!before || !after) return false;
  const selectionId = next.selectionId ?? next.track.id;
  return (
    before.isSelecting === after.isSelecting &&
    before.isSelected(selectionId) === after.isSelected(selectionId) &&
    before.toggle === after.toggle &&
    before.start === after.start &&
    before.selectAll === after.selectAll
  );
}
