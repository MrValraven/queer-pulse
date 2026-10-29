import { m, useIsPresent } from "motion/react";
import { FiArrowDown, FiArrowUp, FiEdit2, FiMenu, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminStudioSpotlightArtistDTO } from "./api/studioSpotlightAdmin.api";
import {
  StudioAdminSpotlightHiddenLine,
  StudioAdminSpotlightIdentity,
  StudioAdminSpotlightNoteLine,
} from "./StudioAdminSpotlightParts";
import { useStudioAdminReorderRow } from "./useStudioAdminReorderRow";
import css from "./StudioAdminSpotlight.module.css";

/** The id a dragged New stars row carries, kept apart from anything else
 *  dropped. */
const SPOTLIGHT_DRAG_TYPE = "application/x-studio-admin-spotlight";

/** One New stars artist: drag handle (pointer devices with a mouse only),
 *  the position inline before the avatar, identity, note, a warning line
 *  when listeners cannot hear them, and Move up, Move down, Edit note and
 *  Remove artist. */
export function StudioAdminNewStarRow({
  star,
  index,
  count,
  isBusy,
  onMove,
  onDropAt,
  onEditNote,
  onRemove,
}: {
  star: AdminStudioSpotlightArtistDTO;
  index: number;
  count: number;
  isBusy: boolean;
  onMove: (targetIndex: number) => void;
  onDropAt: (draggedId: string) => void;
  onEditNote: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  // Destructured so the compiler sees the two refs apart from the plain
  // values and handlers read during render.
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
    dragType: SPOTLIGHT_DRAG_TYPE,
    itemId: star.id,
    index,
    count,
    isBusy,
    onMove,
    onDropAt,
  });
  const { artist } = star;

  return (
    <m.li
      layout="position"
      className={css.row}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      inert={!isPresent || undefined}
      {...dropProps}
    >
      <span
        className={css.dragHandle}
        aria-hidden
        title={t("admin:studioAdmin.dragAria", { name: artist.name })}
        {...handleProps}
      >
        <FiMenu />
      </span>
      <div className={css.cardBody}>
        <div className={css.rowIdentity}>
          <span className={css.position} aria-hidden>
            {index + 1}
          </span>
          <StudioAdminSpotlightIdentity artist={artist} />
        </div>
        <StudioAdminSpotlightNoteLine note={star.note} />
        <Collapse isOpen={!star.isListenable}>
          <StudioAdminSpotlightHiddenLine />
        </Collapse>
      </div>
      <div className={css.actions}>
        <Button
          ref={moveUpRef}
          variant="ghost"
          size="sm"
          aria-label={t("admin:studioAdmin.moveUpAria", { name: artist.name })}
          aria-disabled={isBusy || isFirst || undefined}
          onClick={moveUp}
        >
          <FiArrowUp aria-hidden /> {t("admin:studioAdmin.moveUpCta")}
        </Button>
        <Button
          ref={moveDownRef}
          variant="ghost"
          size="sm"
          aria-label={t("admin:studioAdmin.moveDownAria", {
            name: artist.name,
          })}
          aria-disabled={isBusy || isLast || undefined}
          onClick={moveDown}
        >
          <FiArrowDown aria-hidden /> {t("admin:studioAdmin.moveDownCta")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("admin:studioAdmin.spotlight.editNoteAria", {
            name: artist.name,
          })}
          onClick={onEditNote}
        >
          <FiEdit2 aria-hidden /> {t("admin:studioAdmin.spotlight.editNote")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("admin:studioAdmin.spotlight.removeAria", {
            name: artist.name,
          })}
          aria-disabled={isBusy || undefined}
          data-spotlight-remove
          onClick={() => {
            if (!isBusy) onRemove();
          }}
        >
          <FiX aria-hidden /> {t("admin:studioAdmin.spotlight.removeArtist")}
        </Button>
      </div>
    </m.li>
  );
}
