import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiLayers } from "react-icons/fi";
import { useMotionPrefs } from "../../../../../app/providers/motionPrefs";
import { Collapse } from "../../../../../shared/components/ui";
import type { VjClipDTO } from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import styles from "./VjMixSheet.module.css";

/** --ease and --dur-base, mirrored for motion. */
const TILE_EASE = [0.22, 0.68, 0.16, 1] as const;
const TILE_DURATION_S = 0.25;

export interface VjMixClipPickerProps {
  /** The active pack's clips, in pack order. */
  packClips: readonly VjClipDTO[];
  /** `stage.latestState.liveClipId`: the live clip is never offered. */
  liveClipId: string | null;
  /** The shown mix clip: the stage's, or the one just picked while it travels. */
  mixClipId: string | null;
  isBlocked: boolean;
  onPick: (clipId: string) => void;
}

/** Which empty line the picker shows, or null while it has clips to offer. */
function emptyKeyOf(
  packClips: readonly VjClipDTO[],
  candidateCount: number,
): string | null {
  if (packClips.length === 0) return "vj:remote.packEmpty";
  if (candidateCount === 0) return "vj:mix.pickEmpty";
  return null;
}

/**
 * The mix clip picker: a four-column mini grid of the pack's clips with
 * their thumbnails, the live clip left out. The mix clip carries the coral
 * edge and the layers mark, so the pick reads in shape as well as colour.
 * Tiles glide in and out as the live clip changes.
 */
export function VjMixClipPicker({
  packClips,
  liveClipId,
  mixClipId,
  isBlocked,
  onPick,
}: VjMixClipPickerProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const titleId = useId();
  const candidates = packClips.filter((clip) => clip.id !== liveClipId);
  const emptyKey = emptyKeyOf(packClips, candidates.length);
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: TILE_DURATION_S, ease: TILE_EASE };
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.sectionTitle}>
        {t("vj:mix.pickClip")}
      </h3>
      <Collapse isOpen={emptyKey !== null}>
        <p className={styles.hint}>{emptyKey === null ? "" : t(emptyKey)}</p>
      </Collapse>
      <ul
        className={styles.clipGrid}
        aria-labelledby={titleId}
        data-vj-mix-clip-picker=""
      >
        <AnimatePresence initial={false} mode="popLayout">
          {candidates.map((clip) => {
            const isMixClip = clip.id === mixClipId;
            return (
              <m.li
                key={clip.id}
                layout
                className={styles.clipCell}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={transition}
              >
                <button
                  type="button"
                  className={styles.clipTile}
                  aria-pressed={isMixClip}
                  aria-disabled={isBlocked}
                  aria-label={t("vj:mix.pickClipAria", { title: clip.title })}
                  onClick={() => {
                    if (!isBlocked && !isMixClip) onPick(clip.id);
                  }}
                >
                  <img
                    className={styles.clipThumb}
                    src={clip.thumbnailUrl}
                    alt=""
                    width={80}
                    height={45}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={styles.clipTitle} aria-hidden="true">
                    {clip.title}
                  </span>
                  <FiLayers
                    aria-hidden
                    fill="none"
                    className={styles.clipMark}
                  />
                </button>
              </m.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}
