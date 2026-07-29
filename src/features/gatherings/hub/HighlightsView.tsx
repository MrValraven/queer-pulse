import { useMemo } from "react";
import { Reveal, SectionHead } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import type { CalendarEvent } from "../data";
import { pickHighlights } from "./pickHighlights";
import { EventPosterCard } from "./EventPosterCard";
import { EventPosterSkeleton } from "./EventPosterSkeleton";
import { WaysToGather } from "./WaysToGather";
import { HostCtaBanner } from "./HostCtaBanner";
import { HubEmptyState, HubLoadingLine } from "./HubEmptyState";
import styles from "./HighlightsView.module.css";

const SKELETON_COUNT = 6;

interface HighlightsViewProps {
  events: CalendarEvent[];
  now: Date;
  isLoading: boolean;
}

/**
 * Composite React key for a `CalendarEvent`. `to` alone isn't unique — a few
 * demo events still share a placeholder `/event` link (see `data.ts`).
 */
function eventKey(event: CalendarEvent): string {
  return `${event.title}-${event.date.toISOString()}`;
}

/**
 * Default "Highlights" tab of the Events Hub. `pickHighlights` curates the
 * same 7 events the hub's hero draws its lead poster from — index 0 is
 * already shown there, so this grid renders indices 1–6 (`.slice(1)`) to
 * avoid a duplicate card. Below the grid sits the evergreen platform chrome
 * (ways to gather + host CTA), which stays mounted even with zero upcoming
 * events so a visitor always has somewhere to go next. The host CTA renders
 * outside `.wrap` because it's a full-bleed plum band (see `HostCtaBanner`).
 */
export function HighlightsView({ events, now, isLoading }: HighlightsViewProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && events.length === 0;
  const highlightEvents = useMemo(
    () => pickHighlights(events, now, { count: 7 }).slice(1),
    [events, now],
  );
  const featuredEvents = isLoading || isEmpty ? [] : highlightEvents;

  return (
    <>
      <div className="wrap">
        <Reveal as="section" className={styles.section}>
          {isEmpty ? (
            <HubEmptyState
              titleKey="gatherings:hub.empty.title"
              bodyKey="gatherings:hub.empty.body"
              ctaLabelKey="gatherings:hub.host.cta"
              ctaTo={routes.host}
            />
          ) : (
            <>
              <SectionHead title={t("gatherings:hub.highlights.heading")} />
              {isLoading && <HubLoadingLine labelKey="gatherings:hub.loading" />}
              <div className={styles.grid}>
                {isLoading
                  ? Array.from({ length: SKELETON_COUNT }).map((_, skeletonIndex) => (
                      <EventPosterSkeleton key={skeletonIndex} variant="featured" />
                    ))
                  : featuredEvents.map((event, eventIndex) => (
                      <Reveal
                        key={eventKey(event)}
                        delay={Math.min(eventIndex, 8) * 55}
                      >
                        <EventPosterCard event={event} variant="featured" now={now} />
                      </Reveal>
                    ))}
              </div>
            </>
          )}
        </Reveal>

        <WaysToGather />
      </div>

      <HostCtaBanner />
    </>
  );
}
