import type { JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertTriangle } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./VjGrid.module.css";
import { VJ_TILE_EASE, VJ_TILE_MOTION_SECONDS } from "./vjTileMotion";

interface VjFailureBadgeProps {
  isShown: boolean;
  clipId: string;
  title: string;
  tabIndex: 0 | -1;
  /** MIDI learn runs: the badge lets presses through to the tile's main button. */
  isPickable: boolean;
  onShowFailure: (clipId: string) => void;
}

/**
 * The failure badge in a tile's top-start corner: the 22px amber disc in a
 * 44px hit area, a sibling of the tile's main button (like the star) so a
 * press on it never plays the clip. It opens the sheet that lists the clips
 * that couldn't load, on this clip's row. It fades and scales in and out
 * with the tile's tags. While MIDI learn runs it ignores the pointer, so a
 * tap on its corner reaches the main button and picks the tile's slot.
 */
export function VjFailureBadge({
  isShown,
  clipId,
  title,
  tabIndex,
  isPickable,
  onShowFailure,
}: VjFailureBadgeProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const transition = {
    duration: reducedMotion ? 0 : VJ_TILE_MOTION_SECONDS,
    ease: VJ_TILE_EASE,
  };
  return (
    <AnimatePresence initial={false}>
      {isShown ? (
        <m.button
          key="failure-badge"
          type="button"
          className={styles.failButton}
          aria-label={t("vj:grid.failureAria", { title })}
          aria-haspopup="dialog"
          tabIndex={tabIndex}
          data-vj-failure-badge=""
          data-vj-learn-passthrough={isPickable ? "" : undefined}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={transition}
          onClick={() => onShowFailure(clipId)}
        >
          <span className={styles.failBadge} aria-hidden="true">
            <FiAlertTriangle fill="none" />
          </span>
        </m.button>
      ) : null}
    </AnimatePresence>
  );
}
