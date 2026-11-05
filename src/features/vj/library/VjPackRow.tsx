import type { PointerEvent as ReactPointerEvent } from "react";
import { m, useIsPresent } from "motion/react";
import { FiChevronDown, FiChevronUp, FiFilm, FiMenu } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjPackDTO } from "../../../shared/contracts/vj";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { keepOnFrameLoop } from "../../gatherings/checkin/checkinMotion";
import { formatVjBytes } from "../vjFormat";
import styles from "./VjPacks.module.css";

/** The app's primary ease (`--ease`) and the row timings that go with it. */
const ROW_EASE = [0.22, 0.68, 0.16, 1] as const;
const FOLD_SECONDS = 0.28;
const GLIDE_SECONDS = 0.25;
const COVER_SIZE = 40;

export interface VjPackRowProps {
  pack: VjPackDTO;
  /** The row's index in the rail, from 0. */
  position: number;
  total: number;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onMove: (direction: -1 | 1) => void;
  gripProps: { onPointerDown: (event: ReactPointerEvent) => void };
}

/** The cover: the first clip's thumbnail, or a quiet film mark for an empty pack. */
function PackCover({ coverUrl }: { coverUrl: string | null }) {
  return (
    <span className={styles.cover} aria-hidden="true">
      {coverUrl === null ? (
        <FiFilm fill="none" focusable="false" />
      ) : (
        <img
          src={coverUrl}
          width={COVER_SIZE}
          height={COVER_SIZE}
          alt=""
          loading="lazy"
          decoding="async"
        />
      )}
    </span>
  );
}

/**
 * One pack in the rail. It grows in when created and folds away when deleted;
 * a reorder glides it to its new slot. The grip is the pointer path; the up
 * and down buttons are the keyboard path, blocked at the ends.
 */
export function VjPackRow({
  pack,
  position,
  total,
  isSelected,
  isDragging,
  onSelect,
  onMove,
  gripProps,
}: VjPackRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const foldSeconds = reducedMotion ? 0 : FOLD_SECONDS;
  const isFirst = position <= 0;
  const isLast = position >= total - 1;

  return (
    <m.li
      layout="position"
      inert={!isPresent}
      className={styles.rowItem}
      data-dragging={isDragging ? "true" : undefined}
      onUpdate={keepOnFrameLoop}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{ height: "auto", opacity: 1, overflow: "visible" }}
      exit={{
        height: 0,
        opacity: 0,
        overflow: "hidden",
        transition: {
          duration: foldSeconds,
          ease: ROW_EASE,
          overflow: { duration: 0 },
        },
      }}
      transition={{
        duration: foldSeconds,
        ease: ROW_EASE,
        overflow: { duration: 0, delay: foldSeconds },
        layout: reducedMotion
          ? { duration: 0 }
          : { duration: GLIDE_SECONDS, ease: ROW_EASE },
      }}
    >
      <div className={styles.row}>
        <span className={styles.grip} aria-hidden="true" {...gripProps}>
          <FiMenu fill="none" focusable="false" />
        </span>
        <button
          type="button"
          className={styles.select}
          aria-current={isSelected ? "page" : undefined}
          aria-label={t("vj:packs.showAria", { name: pack.name })}
          onClick={onSelect}
        >
          <PackCover coverUrl={pack.coverThumbnailUrl} />
          <span className={styles.text}>
            <span className={styles.name}>{pack.name}</span>
            <span className={styles.meta}>
              {t("vj:packs.rowMeta", {
                count: pack.clipCount,
                size: formatVjBytes(pack.totalByteSize),
              })}
            </span>
          </span>
        </button>
        <IconButton
          className={styles.move}
          aria-label={t("vj:packs.moveUp", { name: pack.name })}
          aria-disabled={isFirst ? "true" : undefined}
          onClick={() => {
            if (!isFirst) onMove(-1);
          }}
        >
          <FiChevronUp aria-hidden="true" fill="none" focusable="false" />
        </IconButton>
        <IconButton
          className={styles.move}
          aria-label={t("vj:packs.moveDown", { name: pack.name })}
          aria-disabled={isLast ? "true" : undefined}
          onClick={() => {
            if (!isLast) onMove(1);
          }}
        >
          <FiChevronDown aria-hidden="true" fill="none" focusable="false" />
        </IconButton>
      </div>
    </m.li>
  );
}
