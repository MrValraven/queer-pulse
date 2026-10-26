import { useEffect, useId, useState } from "react";
import { AnimatePresence, m, useAnimate } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse, Eyebrow } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { CalendarEvent } from "../data";
import { eventZoneFormat } from "../eventTimezone";
import { gatheringWhen } from "../gatheringSchedule";
import { GatheringBookmarkButton } from "../GatheringBookmarkButton";
import { EventCommunityMenu } from "./EventCommunityMenu";
import { EventDateStamp } from "./EventDateStamp";
import { FormatLine, PricePill, RunByLine, ThemeTags } from "./eventCardParts";
import { FeaturedEventGlow, FeaturedEventMedia } from "./FeaturedEventMedia";
import { GoingCount } from "./GoingCount";
import { HostingCommunityLine } from "./HostingCommunityLine";
import { timeBucketOf } from "./pickHighlights";
import posterStyles from "./EventPosterCard.module.css";
import styles from "./FeaturedEventCard.module.css";

export interface FeaturedEventCardProps {
  lead: CalendarEvent | null;
  /** The instant the time bucket ribbon reads against. Defaults to the
   *  moment the card first rendered. */
  now?: Date;
}

/** How long the outgoing lead takes to dim, and the incoming one to rise,
 *  in seconds. */
const LEAD_SWAP_DIM_SECONDS = 0.1;
const LEAD_SWAP_RISE_SECONDS = 0.2;

/** How far the outgoing lead dims before the swap. The card never goes
 *  blank: the new lead rises from here. */
const LEAD_SWAP_DIM_OPACITY = 0.3;

/** The fade of the community menu trigger as it comes and goes, in seconds. */
const MENU_FADE_SECONDS = 0.18;

/** One identity per gathering, so a refetched copy of the same lead updates
 *  in place and only a different gathering fades through. */
function heroLeadKey(lead: CalendarEvent): string {
  return lead.slug ?? `${lead.title}-${lead.date.toISOString()}`;
}

/**
 * Dims the hero's content, swaps in the new lead, and brings it back up
 * whenever a different gathering takes the lead (its community was hidden,
 * say). The content dims to `LEAD_SWAP_DIM_OPACITY` and no further, so the
 * card always shows a lead. Only the glow and the card's two columns fade:
 * the article and its `<h2>` stay the same elements, so focus parked on the
 * title survives the swap. Reduced motion makes the swap instant.
 */
function useLeadFadeThrough(nextLead: CalendarEvent) {
  const { reducedMotion } = useMotionPrefs();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const nextKey = heroLeadKey(nextLead);
  const [shown, setShown] = useState({ key: nextKey, lead: nextLead });
  const isSwapping = shown.key !== nextKey;
  const dimSeconds = reducedMotion ? 0 : LEAD_SWAP_DIM_SECONDS;
  const riseSeconds = reducedMotion ? 0 : LEAD_SWAP_RISE_SECONDS;
  const fadingParts = `.${styles.glow}, .${styles.card} > *`;

  useEffect(() => {
    if (!isSwapping) return;
    let isCancelled = false;
    void animate(
      fadingParts,
      { opacity: LEAD_SWAP_DIM_OPACITY },
      { duration: dimSeconds, ease: "easeIn" },
    ).then(() => {
      if (!isCancelled) setShown({ key: nextKey, lead: nextLead });
    });
    return () => {
      isCancelled = true;
    };
  }, [animate, dimSeconds, fadingParts, isSwapping, nextKey, nextLead]);

  // Also runs when the lead returns to the one on screen mid-dim, so the
  // content never stays dimmed.
  useEffect(() => {
    if (isSwapping) return;
    void animate(
      fadingParts,
      { opacity: 1 },
      { duration: riseSeconds, ease: "easeOut" },
    );
  }, [animate, fadingParts, isSwapping, riseSeconds, shown.key]);

  return { scope, shownLead: isSwapping ? shown.lead : nextLead };
}

/**
 * The "Next up" poster hero at the top of the Highlights, Browse and Calendar
 * views: the single best upcoming gathering, its cover filling the leading
 * side of the card and its own colours tinting the page behind it. With no
 * lead it folds away, so an empty hero never takes up space; the folding hero
 * keeps showing its last lead until it is gone.
 */
export function FeaturedEventCard({ lead, now }: FeaturedEventCardProps) {
  return (
    <Collapse isOpen={lead !== null}>
      {lead ? <FeaturedEventHero lead={lead} now={now} /> : null}
    </Collapse>
  );
}

function FeaturedEventHero({
  lead: nextLead,
  now,
}: {
  lead: CalendarEvent;
  now: Date | undefined;
}) {
  // `lead` below is the gathering on screen, which trails `nextLead` while
  // the old one fades out.
  const { scope, shownLead: lead } = useLeadFadeThrough(nextLead);
  const { reducedMotion } = useMotionPrefs();
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
    <div ref={scope} className={styles.stage}>
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
              <RunByLine event={lead} className={posterStyles.runByLine} />
              <HostingCommunityLine
                event={lead}
                className={posterStyles.runByLine}
              />
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
              {/* The card is an article of real buttons, so the menu sits in
                  the actions row and opens upward, inside the card. It fades
                  as a lead with or without a community takes the hero. */}
              <AnimatePresence initial={false} mode="wait">
                {lead.hostingCommunity && (
                  <m.div
                    key={lead.hostingCommunity.id}
                    className={styles.menuPresence}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: reducedMotion ? 0 : MENU_FADE_SECONDS,
                      ease: "easeOut",
                    }}
                  >
                    <EventCommunityMenu
                      community={lead.hostingCommunity}
                      eventTitle={lead.title}
                      eventSlug={lead.slug}
                      isCoHosted={lead.isCoHosted ?? false}
                      placement="above"
                    />
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
