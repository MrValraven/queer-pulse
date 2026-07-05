import { ImageSlot } from "../../shared/components/ui";
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
  const placed = singles.length;
  const open = Math.max(0, 14 - placed);

  return (
    <div className={s.slate}>
      <section className={s.group}>
        <div className={s.groupHead}>
          <h2>Cover artist of the week</h2>
          <span className={s.count}>1 of 1 · the room's headline</span>
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
                Swap
              </button>
              <button type="button" className={s.chip} onClick={onEditNote}>
                Edit note
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={s.group}>
        <div className={s.groupHead}>
          <h2>This week's singles</h2>
          <span className={s.count}>
            {placed} of 14 placed · {open} slots open
          </span>
        </div>
        <div className={s.tracks}>
          {singles.map((t, i) => (
            <div key={t.id} className={s.trackSlot}>
              <span className={s.grip} aria-hidden>
                <span className={s.gripDots}>≡</span>
                <span className={s.gripNo}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className={s.trackCov}>
                <ImageSlot
                  src={t.image}
                  tint={t.tint}
                  width={44}
                  height={44}
                  radius={7}
                  placeholder=""
                />
              </span>
              <div className={s.trackMeta}>
                <div className={s.trackTitle}>
                  {t.titlePre}
                  <em>{t.titleEm}</em>
                </div>
                <div className={s.trackWho}>{t.who}</div>
              </div>
              <input
                className={s.noteField}
                value={t.note}
                placeholder="— write a one-line note · why this, why now —"
                onChange={(e) => onNoteChange(t.id, e.target.value)}
                aria-label={`Note for ${t.titlePre}${t.titleEm}`}
              />
              <button
                type="button"
                className={s.remove}
                onClick={() => onRemove(t.id)}
                aria-label={`Remove ${t.titlePre}${t.titleEm}`}
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className={s.emptySlot}>
            ＋ drag a track from submissions, or click to add from catalogue
          </button>
        </div>
      </section>

      <section className={s.group}>
        <div className={s.groupHead}>
          <h2>Collection rotation</h2>
          <span className={s.count}>3 of 3</span>
        </div>
        <div className={s.colls}>
          {COLLECTIONS.map((c) => (
            <div key={c.id} className={s.collSlot}>
              <div className={s.collMeta}>
                <div className={s.collTitle}>
                  {c.titlePre}
                  <em>{c.titleEm}</em>
                </div>
                <div className={s.collSub}>{c.meta}</div>
              </div>
              <span className={`${s.collBadge} ${s[c.badgeTone]}`}>
                {c.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={s.group}>
        <div className={s.groupHead}>
          <h2>Live broadcasts this week</h2>
          <span className={s.count}>2 scheduled · slot 3 open</span>
        </div>
        <div className={s.bcasts}>
          {BROADCASTS.map((b) => (
            <div key={b.id} className={s.bcast}>
              <div className={s.dateBox}>
                <b>{b.day}</b>
                <span>{b.weekday}</span>
              </div>
              <div className={s.bcastMeta}>
                <div className={s.bcastTitle}>
                  {b.titlePre}
                  <em>{b.titleEm}</em>
                </div>
                <div className={s.bcastSub}>{b.meta}</div>
              </div>
              <span className={s.timePill}>{b.time}</span>
            </div>
          ))}
          <button type="button" className={s.emptySlot}>
            ＋ schedule a third broadcast for Saturday late
          </button>
        </div>
      </section>
    </div>
  );
}
