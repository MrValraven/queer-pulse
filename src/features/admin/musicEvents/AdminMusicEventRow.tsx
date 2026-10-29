import { AnimatePresence, m } from "motion/react";
import { FiInbox } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CalendarEvent } from "../../gatherings/data";
import { formatLabel } from "../../gatherings/gatheringCatalog";
import { sizedCover } from "../../gatherings/hub/coverUrl";
import { EventCoverFallback } from "../../gatherings/hub/EventCoverFallback";
import type { MusicEventRowView } from "./api/musicEvents.adapters";
import { AdminChip } from "../ui";
import styles from "./AdminMusicEvents.module.css";

/** The cover thumb's rendered width, so a remote cover is fetched near it. */
const COVER_THUMB_WIDTH = 160;

const ROW_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

/** The card shape the shared cover fallback reads; only the family tints it,
 *  and every house music event is in Music. */
function coverFallbackEvent(row: MusicEventRowView): CalendarEvent {
  return {
    date: row.startAt,
    org: "QueerPulse",
    orgColor: "",
    title: row.title,
    hood: row.venueLabel ?? "",
    to: row.managePath,
    kind: "event",
    gatheringFamily: "music",
  };
}

/**
 * One house music event in the list: cover, title, when and where, its
 * format, how the lineup stands and how many invite requests wait. The
 * Manage event button is the row's only control.
 */
export function AdminMusicEventRow({ row }: { row: MusicEventRowView }) {
  const { t } = useTranslation();
  const format = useFormat();
  const coverSource = sizedCover(
    row.coverImageUrl ?? undefined,
    COVER_THUMB_WIDTH,
  );
  const requestCount = row.pendingInviteRequestCount;
  const declinedCount = row.lineup.declined;
  return (
    <article className={styles.row}>
      <div className={styles.cover}>
        {coverSource ? (
          <img
            className={styles.coverImage}
            src={coverSource}
            alt=""
            loading="lazy"
            decoding="async"
            width={COVER_THUMB_WIDTH}
            height={COVER_THUMB_WIDTH}
          />
        ) : (
          <EventCoverFallback event={coverFallbackEvent(row)} size="card" />
        )}
      </div>
      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          <h2 className={styles.rowTitle}>{row.title}</h2>
          {/* Static for the row's life: a cancelled event leaves the other
              buckets, so the chip never appears on a mounted row. */}
          {row.isCancelled && (
            <AdminChip tone="danger">
              {t("admin:musicEvents.row.cancelled")}
            </AdminChip>
          )}
          <RequestCountPill count={requestCount} />
        </div>
        <p className={styles.rowMeta}>
          <span>
            {format.date(row.startAt, ROW_DATE_OPTIONS)},{" "}
            {format.time(row.startAt)}
          </span>
          {row.venueLabel && <span>{row.venueLabel}</span>}
          <span>{formatLabel(t, row.formatKey)}</span>
        </p>
        <p className={styles.rowLineup}>
          <span className={styles.lineupLabel}>
            {t("admin:musicEvents.row.lineupLabel")}
          </span>
          <span>
            {t("admin:musicEvents.row.lineupConfirmed", {
              count: row.lineup.accepted,
            })}
          </span>
          <span>
            {t("admin:musicEvents.row.lineupInvited", {
              count: row.lineup.pending,
            })}
          </span>
          <span
            className={declinedCount > 0 ? styles.lineupDeclined : undefined}
          >
            {t("admin:musicEvents.row.lineupDeclined", {
              count: declinedCount,
            })}
          </span>
        </p>
      </div>
      <Button
        className={styles.rowAction}
        variant="ghost"
        size="sm"
        to={row.managePath}
        aria-label={t("admin:musicEvents.row.manageAria", { title: row.title })}
      >
        {t("admin:musicEvents.row.manageCta")}
      </Button>
    </article>
  );
}

/** The pill's hidden pose: faded and a touch smaller, so it pops in place. */
const HIDDEN_PILL = { opacity: 0, scale: 0.85 };
const SHOWN_PILL = { opacity: 1, scale: 1 };

/** The accent count of invite requests waiting on this event. It pops in
 *  and out as the count crosses 0, and is named in full for screen readers. */
function RequestCountPill({ count }: { count: number }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key="requests"
          className={styles.requestPill}
          role="img"
          aria-label={t("admin:musicEvents.row.requests", { count })}
          initial={HIDDEN_PILL}
          animate={SHOWN_PILL}
          exit={HIDDEN_PILL}
          transition={{ duration: isReducedMotion ? 0 : 0.2 }}
        >
          <FiInbox aria-hidden />
          {format.number(count)}
        </m.span>
      )}
    </AnimatePresence>
  );
}
