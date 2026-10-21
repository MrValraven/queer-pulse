import { FiArrowDown, FiArrowUp, FiX } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { Button, IconButton, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRowDragReorder } from "../subprofiles/useRowDragReorder";
import { resolveText, type Single } from "./studioProgram.data";
import s from "./StudioProgramPage.module.css";

interface SinglesProps {
  singles: Single[];
  onNoteChange: (id: string, note: string) => void;
  onRemove: (id: string) => void;
  /** Moves the single at `from` to the slot at `to`. */
  onReorder: (from: number, to: number) => void;
  onAddSlot: () => void;
}

/** The singles list: each row drags by its grip, and has Move up and Move
 *  down buttons for keyboard and assistive-tech use. */
export function StudioProgramSingles({
  singles,
  onNoteChange,
  onRemove,
  onReorder,
  onAddSlot,
}: SinglesProps) {
  const { t } = useTranslation();
  const { containerRef, gripHandlers } = useRowDragReorder(onReorder);

  return (
    <>
      <div className={s.tracks} ref={containerRef}>
        {singles.map((single, singleIndex) => {
          const title = `${single.titlePre}${single.titleEm}`;
          const isFirst = singleIndex === 0;
          const isLast = singleIndex === singles.length - 1;
          return (
            <div key={single.id} className={s.trackSlot}>
              <span className={s.grip} {...gripHandlers(singleIndex)}>
                <span className={s.gripDots} aria-hidden>
                  <MdDragIndicator />
                </span>
                <span className={s.gripNo}>
                  {String(singleIndex + 1).padStart(2, "0")}
                </span>
              </span>
              <span className={s.trackCov}>
                <ImageSlot
                  src={single.image}
                  tint={single.tint}
                  width={44}
                  height={44}
                  radius={7}
                  placeholder=""
                />
              </span>
              <div className={s.trackMeta}>
                <div className={s.trackTitle}>
                  {single.titlePre}
                  <em>{single.titleEm}</em>
                </div>
                <div className={s.trackWho}>{resolveText(single.who, t)}</div>
              </div>
              <input
                className={s.noteField}
                value={resolveText(single.note, t)}
                placeholder={t("studio:program.slate.singles.notePlaceholder")}
                onChange={(event) =>
                  onNoteChange(single.id, event.target.value)
                }
                aria-label={t("studio:program.slate.singles.noteAria", {
                  title,
                })}
              />
              <div className={s.rowActions}>
                <IconButton
                  aria-label={t("studio:program.slate.singles.moveUpAria", {
                    title,
                  })}
                  aria-disabled={isFirst}
                  size="sm"
                  tooltip
                  onClick={() => {
                    if (!isFirst) onReorder(singleIndex, singleIndex - 1);
                  }}
                >
                  <FiArrowUp aria-hidden />
                </IconButton>
                <IconButton
                  aria-label={t("studio:program.slate.singles.moveDownAria", {
                    title,
                  })}
                  aria-disabled={isLast}
                  size="sm"
                  tooltip
                  onClick={() => {
                    if (!isLast) onReorder(singleIndex, singleIndex + 1);
                  }}
                >
                  <FiArrowDown aria-hidden />
                </IconButton>
                <IconButton
                  aria-label={t("studio:program.slate.singles.removeAria", {
                    title,
                  })}
                  size="sm"
                  tooltip
                  onClick={() => onRemove(single.id)}
                >
                  <FiX aria-hidden />
                </IconButton>
              </div>
            </div>
          );
        })}
      </div>
      <Button variant="quiet" className={s.emptySlot} onClick={onAddSlot}>
        {t("studio:program.slate.singles.addSlotCta")}
      </Button>
    </>
  );
}
