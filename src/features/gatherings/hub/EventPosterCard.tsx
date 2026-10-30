import { Link } from "react-router-dom";
import {
  PosterAwareImageSlot,
  type ImageSlotTint,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { CalendarEvent } from "../data";
import { eventZoneFormat } from "../eventTimezone";
import { gatheringWhen } from "../gatheringSchedule";
import { sizedCover } from "./coverUrl";
import { EventCommunityMenu } from "./EventCommunityMenu";
import {
  CtaPill,
  EventSpan,
  EventTime,
  FormatLine,
  KindTag,
  MetaRow,
  PricePill,
  RunByLine,
  ThemeTags,
  WhenRibbon,
} from "./eventCardParts";
import { HostingCommunityLine } from "./HostingCommunityLine";
import styles from "./EventPosterCard.module.css";

export type PosterVariant = "lead" | "featured" | "list" | "compact";

/** Retina-aware (~2×) download width per variant's rendered CSS size. The
 *  `lead` poster is already the big hero image, so it keeps the source width. */
const COVER_TARGET_WIDTH: Record<PosterVariant, number | undefined> = {
  lead: undefined,
  featured: 640,
  list: 320,
  compact: 128,
};

interface EventPosterCardProps {
  event: CalendarEvent;
  variant: PosterVariant;
  now?: Date;
  /** Above-the-fold poster (the hero lead) — eager-loads at high priority. */
  priority?: boolean;
  /** The event has already happened (a profile's past events). Drops the
   *  "when" ribbon, whose buckets only describe what is ahead, and puts the
   *  year on the date chip. Off by default, so the hub is unchanged. */
  isPast?: boolean;
  /** Whether a poster naming its hosting community offers the community
   *  menu. On by default, as on the hub; a member's profile turns it off. */
  showCommunityMenu?: boolean;
}

/** Day + month pill, e.g. "6 Jun", or the span across several days, e.g.
 *  "17 to 19 Oct". Rendered in the event's own zone, so a late-night gathering
 *  abroad doesn't slide onto the reader's next day. `gatheringWhen` is the one
 *  place that decides how a span reads, so this pill agrees with the detail
 *  page. `hasYear` adds the year, for an event in the past. */
function DateChip({
  event,
  fmt,
  t,
  hasYear = false,
}: {
  event: CalendarEvent;
  fmt: Formatters;
  t: TFunction;
  hasYear?: boolean;
}) {
  const zone = eventZoneFormat(event.timezone, event.date);
  const when = gatheringWhen(event.date, event.endAt, fmt, t, {
    day: "numeric",
    month: "short",
    ...(hasYear ? { year: "numeric" as const } : {}),
    ...zone.dateOptions,
  });
  return <span className={styles.dateChip}>{when.dateText}</span>;
}

/**
 * The shared poster-forward event card, on the Studio `.heroArt` pattern (aspect-ratio
 * frame + overflow-hidden + absolutely-positioned image fill) with a plum scrim
 * and cream overlay text for `lead`/`featured`/`compact`; a plain thumb-beside-text
 * row for `list`. A landscape cover fills the frame; a poster shows whole over
 * its own blurred backdrop, in every variant. One `<Link>` per card; `aria-label`
 * pins the accessible name to the event title regardless of how much text sits
 * inside. A `lead` or `featured` poster that names its hosting community sits
 * in a `.shell` with the community menu on its top trailing corner, beside the
 * link.
 */
export function EventPosterCard({
  event,
  variant,
  now,
  priority = false,
  isPast = false,
  showCommunityMenu = true,
}: EventPosterCardProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const effectiveNow = now ?? new Date();
  const tint: ImageSlotTint =
    event.orgColor === "var(--accent)" ? "coral" : "plum";
  const loading: "eager" | "lazy" = priority ? "eager" : "lazy";
  const targetWidth = COVER_TARGET_WIDTH[variant];
  const imageProps = {
    src:
      targetWidth === undefined
        ? event.coverImageUrl
        : sizedCover(event.coverImageUrl, targetWidth),
    alt: "",
    tint,
    // A cover-less poster shows the slot's tint alone. Every variant but
    // `list` already sets the title over or beside the frame, so a caption
    // printed the title twice (and, in the 40px compact thumb, as clipped
    // letters). An empty caption keeps the slot from its generic fallback.
    placeholder: variant === "list" ? event.title : "",
    width: "100%",
    height: "100%",
    radius: 0,
    loading,
    fetchPriority: priority ? ("high" as const) : undefined,
    className: styles.coverImage,
    style: { position: "absolute", inset: 0 } as const,
  };

  if (variant === "list") {
    return (
      <Link
        to={event.to}
        aria-label={event.title}
        className={`${styles.link} ${styles.list}`}
      >
        <span className={styles.thumb}>
          <PosterAwareImageSlot {...imageProps} />
        </span>
        <span className={styles.listBody}>
          <span className={styles.badgeRow}>
            <KindTag kind={event.kind} />
          </span>
          <FormatLine event={event} className={`${styles.formatLine}`} />
          <h3 className={styles.titleList}>{event.title}</h3>
          <RunByLine event={event} className={styles.runByLine} />
          <MetaRow event={event}>
            <EventTime event={event} fmt={fmt} />
          </MetaRow>
          <ThemeTags event={event} />
          <PricePill event={event} fmt={fmt} />
        </span>
        <CtaPill className={`${styles.listCta}`} />
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to={event.to}
        aria-label={event.title}
        className={`${styles.link} ${styles.compact}`}
      >
        <span className={styles.thumb}>
          <PosterAwareImageSlot {...imageProps} />
        </span>
        <span className={styles.compactBody}>
          <span className={styles.compactTitle}>{event.title}</span>
          <span className={styles.compactTime}>
            <EventTime event={event} fmt={fmt} />
          </span>
        </span>
      </Link>
    );
  }

  const showRibbon = !isPast && (variant === "lead" || variant === "featured");

  const link = (
    <Link
      to={event.to}
      aria-label={event.title}
      className={`${styles.link} ${styles[variant]}`}
    >
      <span className={styles.frame}>
        <PosterAwareImageSlot {...imageProps} />
        <span className={styles.scrim} aria-hidden />
        <span className={styles.scrimHover} aria-hidden />
        {showRibbon && <WhenRibbon event={event} now={effectiveNow} />}
        {variant === "featured" && <CtaPill className={`${styles.cta}`} />}
        <span className={styles.overlay}>
          <span className={styles.badgeRow}>
            <DateChip event={event} fmt={fmt} t={t} hasYear={isPast} />
            <KindTag kind={event.kind} onScrim />
          </span>
          <FormatLine event={event} className={`${styles.formatLineScrim}`} />
          <h3 className={styles.title}>{event.title}</h3>
          <RunByLine event={event} className={styles.runByLineScrim} />
          <HostingCommunityLine
            event={event}
            className={styles.runByLineScrim}
          />
          <MetaRow event={event}>
            <EventSpan event={event} fmt={fmt} t={t} />
          </MetaRow>
          {/* Capped at two: three wrapped rows of tags on a poster overlay
              cover the cover art. The rest fold into one "+N" tag. */}
          <ThemeTags event={event} onScrim maxVisible={2} />
          <PricePill event={event} fmt={fmt} onScrim />
        </span>
      </span>
    </Link>
  );
  if (!event.hostingCommunity || !showCommunityMenu) return link;
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
