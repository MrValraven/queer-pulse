import { Link } from "react-router-dom";
import {
  PosterAwareImageSlot,
  type ImageSlotTint,
} from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks";
import { useFormat } from "../../../shared/i18n/format";
import type { CalendarEvent } from "../data";
import { eventZoneFormat } from "../eventTimezone";
import { sizedCover } from "./coverUrl";
import { EventCoverFallback } from "./EventCoverFallback";
import { EventCommunityMenu } from "./EventCommunityMenu";
import { EventDateLine, EventDateStamp } from "./EventDateStamp";
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
import { HostingCommunityLine } from "./HostingCommunityLine";
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

/** Retina-aware (~2x) download width for the phone row's ~92px square
 *  thumbnail. */
const TICKET_THUMB_WIDTH = 200;

/** The phone row layout's query, the `--md` breakpoint the stylesheet uses
 *  for the same switch (custom media cannot be read from script). */
const PHONE_ROW_QUERY = "(max-width: 640px)";

/** Theme tags a ticket shows before folding the rest into a "+N" tag. */
const TICKET_VISIBLE_THEMES = 2;

export interface EventTicketCardProps {
  event: CalendarEvent;
  now?: Date;
  /** Above-the-fold card: eager-loads its cover at high priority. */
  isPriority?: boolean;
}

/** The ticket's 4:3 cover with its stamp, ribbon, scrim and bottom badges.
 *  A landscape photo fills it; a poster shows whole over its own blurred
 *  backdrop. An event with no photo wears the tinted `EventCoverFallback`
 *  surface, which needs no scrim, so its badges take their paper fills. On a
 *  phone the cover becomes the row's square thumbnail and the stylesheet
 *  hides the stamp, ribbon and badges there (the text column carries them),
 *  so the thumbnail downloads a small render. */
function TicketMedia({
  event,
  now,
  isUrgent,
  isPriority,
}: {
  event: CalendarEvent;
  now: Date;
  isUrgent: boolean;
  isPriority: boolean;
}) {
  const formatters = useFormat();
  const isPhoneRow = useMediaQuery(PHONE_ROW_QUERY);
  const tint: ImageSlotTint =
    event.orgColor === "var(--accent)" ? "coral" : "plum";
  const hasCover = Boolean(event.coverImageUrl);
  return (
    <span className={styles.media}>
      {hasCover ? (
        <>
          <PosterAwareImageSlot
            src={sizedCover(
              event.coverImageUrl,
              isPhoneRow ? TICKET_THUMB_WIDTH : TICKET_COVER_WIDTH,
            )}
            alt=""
            tint={tint}
            placeholder={event.title}
            width="100%"
            height="100%"
            radius={0}
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : undefined}
            className={styles.coverImage}
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
        <KindTag kind={event.kind} onScrim={hasCover} />
        <PricePill event={event} fmt={formatters} onScrim={hasCover} />
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
 * the body's trailing edge; keyboard focus gets the same reveal. A card that
 * names its hosting community sits in a `.shell` with the community menu
 * pinned to the cover's top trailing corner, beside the link.
 *
 * Below 640px the same card turns into a compact row: a square thumbnail
 * beside the text, a one-line date kicker (with the urgent pill beside it)
 * over the title, and the price beside who is going. The phone-only parts
 * (`.phoneKicker`, `.phonePrice`) are in the markup at every width and the
 * stylesheet shows one set or the other, so the link and its name never
 * change.
 */
export function EventTicketCard({
  event,
  now,
  isPriority = false,
}: EventTicketCardProps) {
  const formatters = useFormat();
  const effectiveNow = now ?? new Date();
  const isUrgent = URGENT_RIBBON_BUCKETS.has(timeBucketOf(event, effectiveNow));
  const zone = eventZoneFormat(event.timezone, event.date);
  const spokenDate = formatters.date(event.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...zone.dateOptions,
  });
  const link = (
    <Link
      to={event.to}
      aria-label={`${event.title}, ${spokenDate}`}
      className={styles.card}
    >
      <span className={styles.surface}>
        <TicketMedia
          event={event}
          now={effectiveNow}
          isUrgent={isUrgent}
          isPriority={isPriority}
        />
        <span className={styles.body}>
          <span className={styles.phoneKicker}>
            <EventDateLine event={event} className={styles.dateLine} />
            {isUrgent && (
              <WhenRibbon
                event={event}
                now={effectiveNow}
                className={`${styles.kickerPill}`}
              />
            )}
          </span>
          <FormatLine
            event={event}
            className={`${posterStyles.formatLine} ${styles.formatLine}`}
          />
          <h3 className={styles.title}>{event.title}</h3>
          <RunByLine
            event={event}
            className={`${posterStyles.runByLine} ${styles.runBy}`}
          />
          <HostingCommunityLine
            event={event}
            className={`${posterStyles.runByLine} ${styles.hostedWith}`}
          />
          <span className={styles.meta}>
            <MetaRow event={event}>
              <EventTime event={event} fmt={formatters} />
            </MetaRow>
          </span>
          <span className={styles.foot}>
            <span className={styles.footRow}>
              <GoingCount event={event} className={`${styles.going}`} />
              <span className={styles.phonePrice}>
                <PricePill event={event} fmt={formatters} />
              </span>
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
  if (!event.hostingCommunity) return link;
  // The menu trigger is a sibling of the link: a button cannot sit inside one.
  return (
    <div className={styles.shell}>
      {link}
      <EventCommunityMenu
        community={event.hostingCommunity}
        eventTitle={event.title}
        eventSlug={event.slug}
        isCoHosted={event.isCoHosted ?? false}
        className={styles.menuSlot}
      />
    </div>
  );
}
