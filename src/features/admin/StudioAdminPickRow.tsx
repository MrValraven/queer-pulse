import { useState } from "react";
import { m } from "motion/react";
import { FiArrowDown, FiArrowUp, FiEdit3, FiMenu, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { tintForId } from "../studio/api/studio.adapters";
import type { AdminStudioPickDTO } from "./api/studioDiscoveryAdmin.api";
import { ageOf } from "./studioAdmin.model";
import { AdminChip } from "./ui";
import { useStudioAdminReorderRow } from "./useStudioAdminReorderRow";
import css from "./StudioAdminPage.module.css";

/** The id a dragged pick carries, kept apart from anything else dropped. */
const PICK_DRAG_TYPE = "application/x-studio-admin-pick";

/** One pick: drag handle, position, cover, title, artist, note, age, a
 *  chip when members cannot hear it, and its four actions. */
export function StudioAdminPickRow({
  pick,
  index,
  count,
  isSingleSlot,
  shelfLabel,
  isBusy,
  onMove,
  onDropAt,
  onEditNote,
  onRemove,
}: {
  pick: AdminStudioPickDTO;
  index: number;
  count: number;
  /** A shelf that holds one pick has nothing to reorder. */
  isSingleSlot: boolean;
  shelfLabel: string;
  isBusy: boolean;
  onMove: (targetIndex: number) => void;
  onDropAt: (draggedPickId: string) => void;
  onEditNote: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  // Destructured so the React compiler sees the two refs apart from the
  // plain values and handlers it reads during render.
  const {
    moveUpRef,
    moveDownRef,
    moveUp,
    moveDown,
    isFirst,
    isLast,
    handleProps,
    dropProps,
  } = useStudioAdminReorderRow({
    dragType: PICK_DRAG_TYPE,
    itemId: pick.id,
    index,
    count,
    isBusy,
    onMove,
    onDropAt,
  });
  // Read once on mount: the age is a coarse label, so a render keeps it.
  const [nowMs] = useState(() => Date.now());
  const title = pick.release.title;
  const age = ageOf(pick.createdAt, nowMs);

  return (
    <m.li
      layout="position"
      className={css.pickRow}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      {...dropProps}
    >
      {!isSingleSlot && (
        <>
          <span
            className={css.dragHandle}
            aria-hidden
            title={t("admin:studioAdmin.dragAria", { name: title })}
            {...handleProps}
          >
            <FiMenu />
          </span>
          <span className={css.position} aria-hidden>
            {index + 1}
          </span>
        </>
      )}
      <span className={css.thumb}>
        <ImageSlot
          src={pick.release.coverUrl ?? undefined}
          tint={tintForId(pick.release.id)}
          width={44}
          height={44}
          radius={8}
          placeholder=""
        />
      </span>
      <div className={css.pickMain}>
        <span className={css.pickTitle}>{title}</span>
        <span className={css.pickMeta}>{pick.release.artist.name}</span>
        <span className={pick.note ? css.pickNote : css.pickNoNote}>
          {pick.note ?? t("admin:studioAdmin.pick.noNote")}
        </span>
        <span className={css.pickMeta}>
          {t("admin:studioAdmin.pick.added", {
            age: fmt.relativeTime(-age.value, age.unit),
          })}
        </span>
        {!pick.isListenable && (
          <AdminChip tone="amber">
            {t("admin:studioAdmin.pick.notListenable")}
          </AdminChip>
        )}
      </div>
      <div className={css.pickActions}>
        {!isSingleSlot && (
          <>
            <Button
              ref={moveUpRef}
              variant="ghost"
              size="sm"
              aria-label={t("admin:studioAdmin.moveUpAria", { name: title })}
              aria-disabled={isBusy || isFirst || undefined}
              onClick={moveUp}
            >
              <FiArrowUp aria-hidden /> {t("admin:studioAdmin.moveUpCta")}
            </Button>
            <Button
              ref={moveDownRef}
              variant="ghost"
              size="sm"
              aria-label={t("admin:studioAdmin.moveDownAria", { name: title })}
              aria-disabled={isBusy || isLast || undefined}
              onClick={moveDown}
            >
              <FiArrowDown aria-hidden /> {t("admin:studioAdmin.moveDownCta")}
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("admin:studioAdmin.pick.editNoteAria", { title })}
          onClick={onEditNote}
        >
          <FiEdit3 aria-hidden /> {t("admin:studioAdmin.pick.editNoteCta")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("admin:studioAdmin.pick.removeAria", {
            title,
            shelf: shelfLabel,
          })}
          aria-disabled={isBusy || undefined}
          data-pick-remove
          onClick={onRemove}
        >
          <FiX aria-hidden /> {t("admin:studioAdmin.pick.removeCta")}
        </Button>
      </div>
    </m.li>
  );
}
