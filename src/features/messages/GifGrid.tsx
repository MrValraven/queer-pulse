import type { RefObject } from "react";
import type { GifAttachment, GifResult } from "../../shared/api/gifs";
import { useGifGridNavigation } from "./useGifGridNavigation";
import { GifTile } from "./GifTile";
import styles from "./GifPicker.module.css";

interface GifGridProps {
  results: GifResult[];
  onPick: (attachment: GifAttachment) => void;
  prefersReducedMotion: boolean;
  gridLabel: string;
  /** See `useGifGridNavigation`: resets keyboard focus to the first tile
   *  when this changes (a new search), and holds it when the same result set
   *  just grows via "Load more". The picker passes its search query. */
  resetKey: unknown;
  /** The picker's scrolling `.body`, passed through to each tile so its
   *  lazy still-frame load can root an `IntersectionObserver` on it. */
  scrollRootRef: RefObject<HTMLDivElement | null>;
}

/** The 2-column grid of GIF thumbnails (DES-205). A labelled `role="group"`
 *  container lays tiles out with the picker's own CSS grid, following
 *  `EmojiGrid`'s plain-div precedent, which keeps assistive tech clear of
 *  older WebKit and VoiceOver's known unreliability with the `display:
 *  contents` wrappers a `role="grid"` + `row`/`gridcell` tree would need.
 *  One roving tab stop moves with the arrow keys, handled on each tile's own
 *  button the way `EmojiGrid` handles its cells, so the container itself
 *  stays a plain, non-interactive group. Each tile is a real button with the
 *  GIF's description as its accessible name. */
export function GifGrid({
  results,
  onPick,
  prefersReducedMotion,
  gridLabel,
  resetKey,
  scrollRootRef,
}: GifGridProps) {
  const { focusedIndex, handleTileKeyDown, registerTile, setFocusedIndex } =
    useGifGridNavigation({ itemCount: results.length, resetKey });

  return (
    <div className={styles.grid} role="group" aria-label={gridLabel}>
      {results.map((result, index) => (
        <GifTile
          key={result.id}
          result={result}
          onPick={onPick}
          prefersReducedMotion={prefersReducedMotion}
          tabIndex={index === focusedIndex ? 0 : -1}
          tileRef={registerTile(index)}
          onFocus={() => setFocusedIndex(index)}
          onKeyDown={handleTileKeyDown}
          scrollRootRef={scrollRootRef}
        />
      ))}
    </div>
  );
}
