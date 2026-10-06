import { useId, useState } from "react";
import { Button, Eyebrow } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { CalendarEvent } from "../data";
import { eventZoneFormat } from "../eventTimezone";
import { gatheringWhen } from "../gatheringSchedule";
import { GatheringBookmarkButton } from "../GatheringBookmarkButton";
import { EventDateStamp } from "./EventDateStamp";
import { FormatLine, PricePill, ThemeTags } from "./eventCardParts";
import { FeaturedEventGlow, FeaturedEventMedia } from "./FeaturedEventMedia";
import { GoingCount } from "./GoingCount";
import { timeBucketOf } from "./pickHighlights";
import posterStyles from "./EventPosterCard.module.css";
import styles from "./FeaturedEventCard.module.css";

export interface FeaturedEventCardProps {
  lead: CalendarEvent | null;
  /** The instant the time bucket ribbon reads against. Defaults to the
   *  moment the card first rendered. */
  now?: Date;
}

/**
 * The "Next up" poster hero at the top of the Highlights, Browse and Calendar
 * views: the single best upcoming gathering, its cover filling the leading
 * side of the card and its own colours tinting the page behind it. Renders
 * nothing when there is no lead, so an empty hero never takes up space.
 */
export function FeaturedEventCard({ lead, now }: FeaturedEventCardProps) {
  if (!lead) return null;
  return <FeaturedEventHero lead={lead} now={now} />;
}

function FeaturedEventHero({
  lead,
  now,
}: {
  lead: CalendarEvent;
  now: Date | undefined;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const titleId = useId();
  const [firstRenderedAt] = useState(() => new Date());
  const readAt = now ?? firstRenderedAt;
  // The lead reads on the event's own clock, labelled when it isn't the
  // reader's own (see `eventZoneFormat`).
  const zone = eventZoneFormat(lead.timezone, lead.date);
  // One shared reading of the schedule, so a gathering that runs past midnight
  // or across several days says so here exactly as it does on its own page.
  const when = gatheringWhen(
    lead.date,
    lead.endAt,
    fmt,
    t,
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      ...zone.dateOptions,
    },
    zone.timeOptions,
  );

  const isUnderWay = timeBucketOf(lead, readAt) === "now";
  // Side by side, the printed stamp carries the day, so the date line drops
  // its date from view (`.whenDate`). A span of two days or more keeps it: the
  // stamp only shows the first day.
  const isDateRange = when.isMultiDay && !when.isNextDay;
  // The theme tags show only side by side (`.themes`), so their wrapper is
  // rendered only when there are tags to hold.
  const hasThemes = (lead.themes ?? []).length > 0;

  return (
    <div className={styles.stage}>
      <FeaturedEventGlow lead={lead} />
      <div className="wrap">
        <article className={styles.card} aria-labelledby={titleId}>
          <FeaturedEventMedia lead={lead} now={readAt} />
          <div className={styles.body}>
            <div className={styles.paperStamp}>
              <EventDateStamp event={lead} size="hero" surface="paper" />
            </div>
            <div className={styles.heading}>
              <Eyebrow live={isUnderWay} className={`${styles.eyebrow}`}>
                {t("gatherings:hub.featured.eyebrow")}
              </Eyebrow>
              <h2 id={titleId} className={styles.title}>
                {lead.title}
              </h2>
            </div>
            <p className={styles.when}>
              <span className={isDateRange ? undefined : styles.whenDate}>
                {when.dateText}
                {" · "}
              </span>
              {when.timeText}
              {when.nextDayNote ? ` ${when.nextDayNote}` : ""}
              {" · "}
              {lead.hood}
            </p>
            <GoingCount event={lead} />
            <div className={styles.facts}>
              <FormatLine
                event={lead}
                className={`${posterStyles.formatLine}`}
              />
              <PricePill event={lead} fmt={fmt} />
              {hasThemes && (
                <span className={styles.themes}>
                  <ThemeTags event={lead} />
                </span>
              )}
            </div>
            <div className={styles.actions}>
              <Button to={lead.to} size="lg">
                {t("gatherings:hub.hero.rsvp")}
              </Button>
              {lead.slug && (
                <GatheringBookmarkButton
                  key={lead.slug}
                  slug={lead.slug}
                  param={lead.slug}
                  bookmarked={lead.isBookmarked ?? false}
                />
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
