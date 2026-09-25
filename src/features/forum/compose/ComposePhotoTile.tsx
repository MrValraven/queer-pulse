import type { Ref } from "react";
import { m, useIsPresent, type Transition } from "motion/react";
import { FiCheck, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  COMPOSE_ALT_MAX_LENGTH,
  type ComposePhoto,
} from "./composeThread.types";
import styles from "./ComposePhotoGrid.module.css";

// ── One staged photo ────────────────────────────────────────────────────────
// Split out of `ComposePhotoGrid.tsx`, whose stylesheet it shares.

/** One staged photo: the animated `<li>`, the preview, its reorder/remove
 *  controls, its alt flag and the description field that clears the flag.
 *  `AnimatePresence` hands the `<li>` a `ref` (React 19 passes it as a prop)
 *  to pop an exiting tile out of flow, so it must land on the `m.li`.
 *
 *  Every handler names the photo by its stable `key`: a tile's position is
 *  only true for the render it was drawn in. A tile on its way out is also
 *  `inert`, so its X, arrows and description cannot be pressed or typed
 *  into while it fades. */
export function ComposePhotoTile({
  ref,
  photo,
  index,
  total,
  transition,
  onAltChange,
  onRemove,
  onMove,
}: {
  ref?: Ref<HTMLLIElement>;
  photo: ComposePhoto;
  index: number;
  total: number;
  transition: Transition;
  onAltChange: (photoKey: string, alt: string) => void;
  onRemove: (photoKey: string) => void;
  onMove: (photoKey: string, direction: -1 | 1) => void;
}) {
  const { t } = useTranslation();
  const isPresent = useIsPresent();
  const hasAlt = !!photo.alt.trim();
  // 1-based, because every label naming this tile is read by a person.
  const position = index + 1;
  const labelValues = { position, total };

  return (
    <m.li
      ref={ref}
      className={styles.tile}
      inert={!isPresent}
      layout="position"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={transition}
    >
      {/* Decorative here: the description the member is writing sits directly
          below, and repeating it as this preview's alt would read it twice. */}
      <img className={styles.preview} src={photo.previewUrl} alt="" />
      <span
        className={[styles.flag, hasAlt && styles.flagDone]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Keyed on the state, so the label remounts and fades across when
            the description is written or cleared. */}
        <span key={hasAlt ? "done" : "needed"} className={styles.flagLabel}>
          {hasAlt && <FiCheck className={styles.flagIcon} aria-hidden />}
          {hasAlt
            ? t("forum:composePage.photo.altDone")
            : t("forum:composePage.photo.altNeeded")}
        </span>
      </span>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.control}
          disabled={index === 0}
          aria-label={t("forum:composePage.photo.moveEarlier", labelValues)}
          onClick={() => onMove(photo.key, -1)}
        >
          <FiChevronLeft className={styles.controlIcon} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.control}
          disabled={index === total - 1}
          aria-label={t("forum:composePage.photo.moveLater", labelValues)}
          onClick={() => onMove(photo.key, 1)}
        >
          <FiChevronRight className={styles.controlIcon} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.control}
          aria-label={t("forum:composePage.photo.remove", labelValues)}
          onClick={() => onRemove(photo.key)}
        >
          <FiX className={styles.controlIcon} aria-hidden />
        </button>
      </div>
      <input
        type="text"
        className={[styles.alt, hasAlt && styles.altDone]
          .filter(Boolean)
          .join(" ")}
        value={photo.alt}
        maxLength={COMPOSE_ALT_MAX_LENGTH}
        placeholder={t("forum:composePage.photo.altPlaceholder")}
        aria-label={t("forum:composePage.photo.altLabel", labelValues)}
        onChange={(event) => onAltChange(photo.key, event.target.value)}
      />
    </m.li>
  );
}
