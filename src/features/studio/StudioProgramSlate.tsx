import { FiX } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COVER,
  COLLECTIONS,
  BROADCASTS,
  type Single,
} from "./studioProgram.data";
import s from "./StudioProgramPage.module.css";

interface SlateProps {
  singles: Single[];
  onNoteChange: (id: string, note: string) => void;
  onRemove: (id: string) => void;
  onSwap: () => void;
  onEditNote: () => void;
}

/** The left programming column: cover, singles, collections, broadcasts. */
export function StudioProgramSlate({
  singles,
  onNoteChange,
  onRemove,
  onSwap,
  onEditNote,
}: SlateProps) {
  const { t } = useTranslation();
  const placed = singles.length;
  const totalSlots = 14;
  const open = Math.max(0, totalSlots - placed);

  return (
    <div className={s.slate}>
      <section className={s.group}>
        <div className={s.groupHead}>
          <h2>{t("studio:program.slate.cover.heading")}</h2>
          <span className={s.count}>
            {t("studio:program.slate.cover.count")}
          </span>
        </div>
        <div className={s.coverSlot}>
          <div className={s.coverArt}>
            <ImageSlot
              src={COVER.image}
              tint={COVER.tint}
              width="100%"
              height="100%"
              radius={12}
              placeholder=""
            />
          </div>
          <div className={s.coverBody}>
            <h3>
              {COVER.titlePre}
              <em>{COVER.titleEm}</em>
            </h3>
            <div className={s.coverBy}>{COVER.by}</div>
            <blockquote className={s.coverNote}>{COVER.note}</blockquote>
            <div className={s.coverActions}>
              <button type="button" className={s.chip} onClick={onSwap}>
                {t("studio:program.slate.cover.swapCta")}
              </button>
              <button type="button" className={s.chip} onClick={onEditNote}>
                {t("studio:program.slate.cover.editNoteCta")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={s.group}>
        <div className={s.groupHead}>
          <h2>{t("studio:program.slate.singles.heading")}</h2>
          <span className={s.count}>
            {t("studio:program.slate.singles.count", {
              placed,
              total: totalSlots,
              open,
            })}
          </span>
        </div>
        <div className={s.tracks}>
          {singles.map((single, singleIndex) => (
            <div key={single.id} className={s.trackSlot}>
              <span className={s.grip} aria-hidden>
                <span className={s.gripDots}>
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
                <div className={s.trackWho}>{single.who}</div>
              </div>
              <input
                className={s.noteField}
                value={single.note}
                placeholder={t("studio:program.slate.singles.notePlaceholder")}
                onChange={(e) => onNoteChange(single.id, e.target.value)}
                aria-label={t("studio:program.slate.singles.noteAria", {
                  title: `${single.titlePre}${single.titleEm}`,
                })}
              />
              <button
                type="button"
                className={s.remove}
                onClick={() => onRemove(single.id)}
                aria-label={t("studio:program.slate.singles.removeAria", {
                  title: `${single.titlePre}${single.titleEm}`,
                })}
              >
                <FiX aria-hidden />
              </button>
            </div>
          ))}
          <button type="button" className={s.emptySlot}>
            {t("studio:program.slate.singles.addSlotCta")}
          </button>
        </div>
      </section>

      <section className={s.group}>
        <div className={s.groupHead}>
          <h2>{t("studio:program.slate.collections.heading")}</h2>
          <span className={s.count}>
            {t("studio:program.slate.collections.count", {
              placed: COLLECTIONS.length,
              total: COLLECTIONS.length,
            })}
          </span>
        </div>
        <div className={s.colls}>
          {COLLECTIONS.map((collection) => (
            <div key={collection.id} className={s.collSlot}>
              <div className={s.collMeta}>
                <div className={s.collTitle}>
                  {collection.titlePre}
                  <em>{collection.titleEm}</em>
                </div>
                <div className={s.collSub}>{collection.meta}</div>
              </div>
              <span className={`${s.collBadge} ${s[collection.badgeTone]}`}>
                {collection.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={s.group}>
        <div className={s.groupHead}>
          <h2>{t("studio:program.slate.broadcasts.heading")}</h2>
          <span className={s.count}>
            {t("studio:program.slate.broadcasts.count", {
              scheduled: BROADCASTS.length,
              slotNumber: BROADCASTS.length + 1,
            })}
          </span>
        </div>
        <div className={s.bcasts}>
          {BROADCASTS.map((broadcast) => (
            <div key={broadcast.id} className={s.bcast}>
              <div className={s.dateBox}>
                <b>{broadcast.day}</b>
                <span>{broadcast.weekday}</span>
              </div>
              <div className={s.bcastMeta}>
                <div className={s.bcastTitle}>
                  {broadcast.titlePre}
                  <em>{broadcast.titleEm}</em>
                </div>
                <div className={s.bcastSub}>{broadcast.meta}</div>
              </div>
              <span className={s.timePill}>{broadcast.time}</span>
            </div>
          ))}
          <button type="button" className={s.emptySlot}>
            {t("studio:program.slate.broadcasts.addSlotCta")}
          </button>
        </div>
      </section>
    </div>
  );
}
