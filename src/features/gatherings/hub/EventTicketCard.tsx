import { Link } from "react-router-dom";
import { ImageSlot, type ImageSlotTint } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import type { CalendarEvent } from "../data";
import { eventZoneFormat } from "../eventTimezone";
import { sizedCover } from "./coverUrl";
import { EventCoverFallback } from "./EventCoverFallback";
import { EventDateStamp } from "./EventDateStamp";
import {
  CtaPill,
  EventTime,
  FormatLine,
  KindTag,
  MetaRow,
  PricePill,
  RunByLine,
  ThemeTags,
  WhenRibbon,
} from "./eventCardParts";
import { GoingCount } from "./GoingCount";
import { timeBucketOf, type TimeBucket } from "./pickHighlights";
import posterStyles from "./EventPosterCard.module.css";
import styles from "./EventTicketCard.module.css";

/** The buckets urgent enough to earn a ribbon on a ticket card: a gathering
 *  under way right now, and one starting later today. "This weekend" and
 *  further out are already plain from the date stamp beside it. */
const URGENT_RIBBON_BUCKETS: ReadonlySet<TimeBucket> = new Set([
  "now",
  "tonight",
]);

/** Retina-aware (~2x) download width for the ticket's 4:3 cover. */
const TICKET_COVER_WIDTH = 640;

/** Theme tags a ticket shows before folding the rest into a "+N" tag. */
const TICKET_VISIBLE_THEMES = 2;

export interface EventTicketCardProps {
  event: CalendarEvent;
  now?: Date;
  /** Above-the-fold card: eager-loads its cover at high priority. */
  isPriority?: boolean;
}

/** The ticket's 4:3 cover with its stamp, ribbon, scrim and bottom badges.
 *  A gathering with no photo wears the branded `EventCoverFallback` field,
 *  which is dark enough on its own, so the scrim is skipped there. */
function TicketMedia({
  event,
  now,
  isPriority,
}: Required<EventTicketCardProps>) {
  const formatters = useFormat();
  const tint: ImageSlotTint =
    event.orgColor === "var(--accent)" ? "coral" : "plum";
  const isUrgent = URGENT_RIBBON_BUCKETS.has(timeBucketOf(event, now));
  const hasCover = Boolean(event.coverImageUrl);
  return (
    <span className={styles.media}>
      {hasCover ? (
        <>
          <ImageSlot
            src={sizedCover(event.coverImageUrl, TICKET_COVER_WIDTH)}
            alt=""
            tint={tint}
            placeholder={event.title}
            width="100%"
            height="100%"
            radius={0}
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : undefined}
            style={{ position: "absolute", inset: 0 }}
          />
          <span className={styles.scrim} aria-hidden />
        </>
      ) : (
        <EventCoverFallback event={event} size="card" />
      )}
      <span className={styles.stamp}>
        <EventDateStamp event={event} size="card" surface="onImage" />
      </span>
      {isUrgent && (
        <WhenRibbon
          event={event}
          now={now}
          className={`${posterStyles.ribbon} ${posterStyles.urgentRibbon} ${styles.ribbon}`}
        />
      )}
      <span className={styles.mediaFoot}>
        <KindTag kind={event.kind} onScrim />
        <PricePill event={event} fmt={formatters} onScrim />
      </span>
    </span>
  );
}

/**
 * The Browse tab's event card: a 4:3 cover carrying a cream date stamp, then a
 * paper body with the format, a Fraunces title, where and when, who is going
 * and the host's theme tags. One `<Link>` per card, named by the event title
 * and its date (the stamp itself is hidden from assistive tech). On a precise
 * pointer the card lifts, the cover eases in and a "See it" pill slides in at
 * the body's trailing edge; keyboard focus gets the same reveal.
 */
export function EventTicketCard({
  event,
  now,
  isPriority = false,
}: EventTicketCardProps) {
  const formatters = useFormat();
  const zone = eventZoneFormat(event.timezone, event.date);
  const spokenDate = formatters.date(event.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...zone.dateOptions,
  });
  return (
    <Link
      to={event.to}
      aria-label={`${event.title}, ${spokenDate}`}
      className={styles.card}
    >
      <span className={styles.surface}>
        <TicketMedia
          event={event}
          now={now ?? new Date()}
          isPriority={isPriority}
        />
        <span className={styles.body}>
          <FormatLine event={event} className={`${posterStyles.formatLine}`} />
          <h3 className={styles.title}>{event.title}</h3>
          <RunByLine event={event} className={posterStyles.runByLine} />
          <span className={styles.meta}>
            <MetaRow event={event}>
              <EventTime event={event} fmt={formatters} />
            </MetaRow>
          </span>
          <span className={styles.foot}>
            <span className={styles.footRow}>
              <GoingCount event={event} className={`${styles.going}`} />
              <CtaPill className={`${styles.cta}`} />
            </span>
            <span className={styles.themeStrip}>
              <ThemeTags event={event} maxVisible={TICKET_VISIBLE_THEMES} />
            </span>
          </span>
        </span>
      </span>
    </Link>
  );
}
