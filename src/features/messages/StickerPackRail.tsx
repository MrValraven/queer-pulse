// src/features/messages/StickerPackRail.tsx
import type {
  StickerPackResponse,
  StickerResponse,
} from "../../shared/contracts/contracts";
import styles from "./StickerPackRail.module.css";

interface StickerPackRailProps {
  packs: StickerPackResponse[];
  /** The pack whose section is currently scrolled into `StickerPicker`'s own
   *  scroll area, from its IntersectionObserver, or the pack a rail tap just
   *  targeted (set at once, ahead of the observer catching up). `undefined`
   *  before either has ever fired. */
  activePackId: string | undefined;
  coverStickerFor: (pack: StickerPackResponse) => StickerResponse | undefined;
  onSelectPack: (packId: string) => void;
  ariaLabel: string;
}

/**
 * One small cover tile per published pack, jumping `StickerPicker`'s own
 * scroll area to that pack's section. Renders at two or more packs and
 * returns `null` at fewer, gating itself: a single pack has nothing to jump
 * between. Extracted out of `StickerPicker.tsx` to keep that component under
 * the repo's 200-line budget.
 */
export function StickerPackRail({
  packs,
  activePackId,
  coverStickerFor,
  onSelectPack,
  ariaLabel,
}: StickerPackRailProps) {
  if (packs.length < 2) return null;
  return (
    <div className={styles.packRail} role="toolbar" aria-label={ariaLabel}>
      {packs.map((pack) => {
        const cover = coverStickerFor(pack);
        const isActive = pack.id === activePackId;
        return (
          <button
            key={pack.id}
            type="button"
            className={
              isActive
                ? `${styles.packTile} ${styles.packTileActive}`
                : styles.packTile
            }
            aria-label={pack.name}
            aria-pressed={isActive}
            title={pack.name}
            onClick={() => onSelectPack(pack.id)}
          >
            {cover && <img src={cover.url} alt="" width={28} height={28} />}
          </button>
        );
      })}
    </div>
  );
}
