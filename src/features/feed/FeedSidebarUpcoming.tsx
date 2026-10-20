import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { eventZoneFormat } from "../gatherings/eventTimezone";
import type { SidebarGathering } from "./feed.data";
import { buildDemoSidebarGatherings } from "./feedSidebarUpcoming.data";
import { daysFromToday } from "./sidebarUpcomingDay";
import styles from "./FeedPage.module.css";

/** Stagger between rows as they swap in from their skeletons. */
const ROW_REVEAL_STEP_MS = 60;

function UpcomingRowSkeleton() {
  return (
    <div className={styles.upcomingRow} aria-hidden>
      <SkeletonLine
        width={44}
        height={44}
        style={{ borderRadius: 10, flex: "none" }}
      />
      <div className={styles.upBody}>
        <SkeletonLine width="75%" height={13} />
        <SkeletonLine width="50%" height={11} style={{ marginTop: 7 }} />
      </div>
    </div>
  );
}

/** One event: a calendar tile (filled when it starts today), the title, and a
 *  meta line reading "Today · 19:00 · Venue". */
function UpcomingRow({
  gathering,
  now,
  revealDelayMs,
}: {
  gathering: SidebarGathering;
  now: Date;
  revealDelayMs: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const zone = eventZoneFormat(gathering.timezone, gathering.date);
  const dayOffset = daysFromToday(
    gathering.date,
    now,
    zone.dateOptions.timeZone,
  );
  const isToday = dayOffset === 0;
  const isTomorrow = dayOffset === 1;
  // pt-PT abbreviates with a trailing full stop ("out."), which reads as noise
  // on an uppercase tile label.
  const monthLabel = fmt
    .date(gathering.date, { month: "short", ...zone.dateOptions })
    .replace(/\.$/u, "");
  const dayLabel = fmt.date(gathering.date, {
    day: "numeric",
    ...zone.dateOptions,
  });
  const weekdayLabel = isToday
    ? t("feed:sidebar.today")
    : isTomorrow
      ? t("feed:sidebar.tomorrow")
      : fmt.date(gathering.date, { weekday: "short", ...zone.dateOptions });
  const metaParts = [
    weekdayLabel,
    fmt.time(gathering.date, zone.timeOptions),
    gathering.venue,
  ].filter((part) => part.length > 0);

  return (
    <Link
      to={gathering.to}
      className={`${styles.upcomingRow} ${styles.revealRow}`}
      style={{ animationDelay: `${revealDelayMs}ms` }}
    >
      <time
        className={`${styles.dateTile} ${isToday ? styles.dateTileToday : ""}`}
        dateTime={gathering.date.toISOString()}
      >
        <span className={styles.dateTileMonth}>{monthLabel}</span>
        <span className={styles.dateTileDay}>{dayLabel}</span>
      </time>
      <span className={styles.upBody}>
        <span className={styles.upName}>{gathering.name}</span>
        <span className={styles.upMeta}>{metaParts.join(" · ")}</span>
      </span>
    </Link>
  );
}

/** The feed sidebar's "Upcoming" card: the viewer's next events as a short
 *  calendar list, with a way through to the full calendar. */
export function FeedSidebarUpcoming({
  loading,
  populated,
  gatherings,
}: {
  loading: boolean;
  /** Demo-only: paint the curated mock rows instead of `gatherings`. */
  populated: boolean;
  /** The viewer's own upcoming events in live mode. Empty renders the empty
   *  state. */
  gatherings: SidebarGathering[];
}) {
  const { t } = useTranslation();
  // One clock per mount, so every row (and the demo rows' dates) agree on what
  // "today" is.
  const now = useMemo(() => new Date(), []);
  const demoGatherings = useMemo(() => buildDemoSidebarGatherings(now), [now]);
  const rows = populated ? demoGatherings : gatherings;

  return (
    <div className={styles.sbCard}>
      <div className={styles.sbTitle}>{t("feed:sidebar.upcomingHeading")}</div>
      {loading ? (
        Array.from({ length: 2 }).map((_, placeholderIndex) => (
          <UpcomingRowSkeleton key={placeholderIndex} />
        ))
      ) : rows.length === 0 ? (
        <p className={styles.sbEmpty}>{t("feed:sidebar.upcomingEmpty")}</p>
      ) : (
        rows.map((gathering, rowIndex) => (
          <UpcomingRow
            key={gathering.to}
            gathering={gathering}
            now={now}
            revealDelayMs={rowIndex * ROW_REVEAL_STEP_MS}
          />
        ))
      )}
      <Link to={routes.calendar} className={styles.sbLink}>
        {t("feed:sidebar.seeCalendar")} <FiArrowRight aria-hidden />
      </Link>
    </div>
  );
}
