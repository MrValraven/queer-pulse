import { AnimatePresence, m } from "motion/react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioAdminShelves.module.css";

/** One segment per slot, filled up to the count. Decorative: the count
 *  text beside it says the same in words. */
export function StudioAdminShelfMeter({
  count,
  max,
}: {
  count: number;
  max: number;
}) {
  return (
    <span className={css.meter} aria-hidden>
      {Array.from({ length: max }, (_unused, slotIndex) => (
        <span
          key={slotIndex}
          className={css.meterSlot}
          data-filled={slotIndex < count || undefined}
        />
      ))}
    </span>
  );
}

/** The last cell of a shelf: a dashed sleeve that opens the add dialog, or
 *  a quiet "full" sleeve (aria-disabled) once every slot is taken. It sits
 *  in the shelf's grid beside the list of picks, so the list holds picks
 *  only. */
export function StudioAdminAddTile({
  addLabel,
  fullLabel,
  isFull,
  onAdd,
}: {
  addLabel: string;
  fullLabel: string;
  isFull: boolean;
  onAdd: () => void;
}) {
  const { reducedMotion } = useMotionPrefs();
  const fade = { duration: reducedMotion ? 0 : 0.18 };
  return (
    <m.div
      layout="position"
      className={css.tileCell}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
    >
      <button
        type="button"
        className={css.addTile}
        data-full={isFull || undefined}
        aria-label={isFull ? fullLabel : addLabel}
        aria-disabled={isFull || undefined}
        onClick={() => {
          if (!isFull) onAdd();
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={isFull ? "full" : "add"}
            className={css.addTileInner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <span className={css.addTileIcon} aria-hidden>
              {isFull ? <FiCheck /> : <FiPlus />}
            </span>
            <span className={css.addTileLabel}>
              {isFull ? fullLabel : addLabel}
            </span>
          </m.span>
        </AnimatePresence>
      </button>
    </m.div>
  );
}

/** One empty dashed slot after the add tile on an empty shelf, hidden from
 *  screen readers. The grid clips the slots to one row. Keyed straight
 *  under an AnimatePresence, so it fades out as the first pick lands. */
export function StudioAdminGhostSleeve({ ghostIndex }: { ghostIndex: number }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.div
      layout="position"
      className={css.ghostCell}
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.22,
        delay: reducedMotion ? 0 : ghostIndex * 0.04,
      }}
    >
      <span className={css.ghostSleeve} />
    </m.div>
  );
}

/** The quiet "Add a note" link a pick without a note shows where its note
 *  would sit. It opens the same note dialog as Edit note. */
export function StudioAdminAddNoteLink({
  title,
  className,
  onClick,
}: {
  title: string;
  className?: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={
        className ? `${css.addNoteLink} ${className}` : css.addNoteLink
      }
      aria-label={t("admin:studioAdmin.pick.addNoteAria", { title })}
      onClick={onClick}
    >
      {t("admin:studioAdmin.pick.addNoteCta")}
    </button>
  );
}
