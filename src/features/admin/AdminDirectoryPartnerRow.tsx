import { useState } from "react";
import { m } from "motion/react";
import { MdDragIndicator } from "react-icons/md";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  AdminDirectoryPartnerDTO,
  DirectoryPartnerPublicState,
} from "../marketing/api/directoryPartners.api";
import {
  PARTNER_ROW_DURATION_S,
  PARTNER_ROW_SCALE_FROM,
} from "./AdminDirectoryPartners.data";
import {
  DIRECTORY_PARTNER_DRAG_TYPE,
  DIRECTORY_PARTNER_PUBLIC_STATE_KEY,
} from "./adminDirectoryPartners.model";
import { AdminDirectoryPartnerRowActions } from "./AdminDirectoryPartnerRowActions";
import { AdminDirectoryPartnerThumb } from "./AdminDirectoryPartnerThumb";
import { AdminChip } from "./ui";
import { useStudioAdminReorderRow } from "./useStudioAdminReorderRow";
import css from "./AdminDirectoryPartners.module.css";

/** One partner: the cover (the drag handle), its position, name,
 *  neighbourhood, note (or an Add a note link), a "Not showing" chip while
 *  the public row leaves it out, and four icon actions. The whole row takes
 *  the drop. */
export function AdminDirectoryPartnerRow({
  partner,
  index,
  count,
  isBusy,
  onMove,
  onDropAt,
  onEditNote,
  onRemove,
}: {
  partner: AdminDirectoryPartnerDTO;
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
    dragType: DIRECTORY_PARTNER_DRAG_TYPE,
    itemId: partner.id,
    index,
    count,
    isBusy,
    onMove,
    onDropAt,
  });
  const { name, publicState } = partner;
  // The last note and the last "Not showing" reason stay drawn while their
  // fold closes, so the text leaves with the fold.
  const [lastNote, setLastNote] = useState(partner.note);
  if (partner.note && partner.note !== lastNote) setLastNote(partner.note);
  const shownNote = partner.note || lastNote;
  const hiddenState = publicState === "showing" ? null : publicState;
  const [lastHiddenState, setLastHiddenState] = useState<Exclude<
    DirectoryPartnerPublicState,
    "showing"
  > | null>(hiddenState);
  if (hiddenState !== null && hiddenState !== lastHiddenState)
    setLastHiddenState(hiddenState);
  const shownHiddenState = hiddenState ?? lastHiddenState;
  const scaleFrom = reducedMotion ? 1 : PARTNER_ROW_SCALE_FROM;

  return (
    <m.li
      layout="position"
      className={css.row}
      initial={{ opacity: 0, scale: scaleFrom }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: scaleFrom }}
      transition={{ duration: reducedMotion ? 0 : PARTNER_ROW_DURATION_S }}
      {...dropProps}
    >
      <div
        className={css.thumbWrap}
        aria-hidden
        title={t("admin:directoryPartners.row.dragTitle", { name })}
        {...handleProps}
      >
        <AdminDirectoryPartnerThumb
          coverImage={partner.coverImage}
          tint={partner.tint}
          initials={partner.av}
        />
        {/* Always drawn; the CSS fades it in on a draggable cover. */}
        <span className={css.grip}>
          <MdDragIndicator />
        </span>
      </div>
      <div className={css.body}>
        <span className={css.nameLine}>
          <span className={css.position}>{index + 1}</span>
          <span className={css.name} data-partner-name>
            {name}
          </span>
        </span>
        {partner.hood ? <span className={css.hood}>{partner.hood}</span> : null}
        <Collapse isOpen={Boolean(partner.note)} className={css.chipFold}>
          <span className={css.note}>{shownNote}</span>
        </Collapse>
        <Collapse isOpen={!partner.note} className={css.chipFold}>
          <button
            type="button"
            className={css.addNoteLink}
            aria-label={t("admin:directoryPartners.row.addNoteAria", { name })}
            onClick={onEditNote}
          >
            {t("admin:directoryPartners.row.addNoteCta")}
          </button>
        </Collapse>
        <Collapse isOpen={hiddenState !== null} className={css.chipFold}>
          {shownHiddenState ? (
            <AdminChip tone="amber" className={css.chip}>
              {t(DIRECTORY_PARTNER_PUBLIC_STATE_KEY[shownHiddenState])}
            </AdminChip>
          ) : null}
        </Collapse>
      </div>
      <AdminDirectoryPartnerRowActions
        name={name}
        isBusy={isBusy}
        isFirst={isFirst}
        isLast={isLast}
        moveUpRef={moveUpRef}
        moveDownRef={moveDownRef}
        onMoveUp={moveUp}
        onMoveDown={moveDown}
        onEditNote={onEditNote}
        onRemove={onRemove}
      />
    </m.li>
  );
}
