import { FiPlus } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioProgramSingles } from "./StudioProgramSingles";
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
  onReorder: (from: number, to: number) => void;
  onAddSlot: () => void;
  onAddBroadcast: () => void;
  onSwap: () => void;
  onEditNote: () => void;
}

/** The left programming column: cover, singles, collections, broadcasts. */
export function StudioProgramSlate({
  singles,
  onNoteChange,
  onRemove,
  onReorder,
  onAddSlot,
  onAddBroadcast,
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
            <div className={s.coverBy}>{t(COVER.by.key, COVER.by.values)}</div>
            <blockquote className={s.coverNote}>
              <Translation
                i18nKey={COVER.noteKey}
                components={{ em: <em /> }}
              />
            </blockquote>
            <div className={s.coverActions}>
              <Button variant="quiet" size="sm" onClick={onSwap}>
                {t("studio:program.slate.cover.swapCta")}
              </Button>
              <Button variant="quiet" size="sm" onClick={onEditNote}>
                {t("studio:program.slate.cover.editNoteCta")}
              </Button>
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
        <StudioProgramSingles
          singles={singles}
          onNoteChange={onNoteChange}
          onRemove={onRemove}
          onReorder={onReorder}
          onAddSlot={onAddSlot}
        />
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
                <div className={s.collSub}>
                  {t(collection.meta.key, collection.meta.values)}
                </div>
              </div>
              <span className={`${s.collBadge} ${s[collection.badgeTone]}`}>
                {t(collection.badge.key, collection.badge.values)}
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
                <span>{t(broadcast.weekdayKey)}</span>
              </div>
              <div className={s.bcastMeta}>
                <div className={s.bcastTitle}>
                  {broadcast.leadKey && `${t(broadcast.leadKey)} · `}
                  {broadcast.titlePre}
                  <em>{broadcast.titleEm}</em>
                </div>
                <div className={s.bcastSub}>
                  {t(broadcast.meta.key, broadcast.meta.values)}
                </div>
              </div>
              <span className={s.timePill}>{broadcast.time}</span>
            </div>
          ))}
          <Button
            variant="quiet"
            className={s.emptySlot}
            onClick={onAddBroadcast}
          >
            <FiPlus aria-hidden />{" "}
            {t("studio:program.slate.broadcasts.addSlotLabel")}
          </Button>
        </div>
      </section>
    </div>
  );
}
