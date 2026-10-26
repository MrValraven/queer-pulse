import { AnimatePresence } from "motion/react";
import { Reveal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CalendarEvent } from "../data";
import { EventAgendaRow } from "./EventAgendaRow";
import { EventCellPresence } from "./EventCellPresence";
import { EventPosterSkeleton } from "./EventPosterSkeleton";
import { EventTicketCard } from "./EventTicketCard";
import type { BrowseLayout } from "./useBrowseLayout";
import styles from "./BrowseMonthGroup.module.css";

/** How many cards at the top of the board eager-load their covers. */
const PRIORITY_CARD_COUNT = 2;

/** Stagger step between neighbouring cards' reveal, and the most cards that
 *  stagger before the rest arrive together. */
const REVEAL_STEP_MS = 40;
const REVEAL_MAX_STAGGER = 8;

/** The wrapper class for the active layout: a grid for tickets, a column for
 *  the agenda. Loading placeholders share it, so nothing shifts on arrival. */
function listClassFor(layout: BrowseLayout): string {
  return layout === "tickets" ? `${styles.ticketGrid}` : `${styles.agendaList}`;
}

function itemClassFor(layout: BrowseLayout): string {
  return layout === "tickets" ? `${styles.ticketCell}` : `${styles.agendaItem}`;
}

/** The scroll reveal inside a live cell. The cell is the grid item that
 *  folds away when its event leaves the list; the reveal lays the card out
 *  inside it. */
function revealClassFor(layout: BrowseLayout): string {
  return layout === "tickets"
    ? `${styles.ticketReveal}`
    : `${styles.agendaReveal}`;
}

/**
 * One month's worth of events: a sticky italic heading carrying a quiet count,
 * over either a grid of ticket cards or a single agenda column.
 *
 * The count sits inside the `<h2>` behind a visually hidden comma, so heading
 * navigation reads "October 2026, 3 gatherings" in one breath. It is left out
 * while the month may still be filling up (the last loaded month with more
 * pages to come), because a count that grows as the member scrolls would be
 * a number the board cannot yet stand behind.
 */
export function MonthGroup({
  label,
  events,
  layout,
  now,
  isFirstMonth,
  isCountShown,
}: {
  label: string;
  events: CalendarEvent[];
  layout: BrowseLayout;
  now: Date;
  isFirstMonth: boolean;
  isCountShown: boolean;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.monthGroup}>
      <h2 className={styles.monthHeading}>
        {label}
        {isCountShown && (
          <>
            <span className="visuallyHidden">, </span>
            <span className={styles.monthCount}>
              {t("gatherings:hub.browse.monthCount", { count: events.length })}
            </span>
          </>
        )}
      </h2>
      <div className={listClassFor(layout)}>
        {/* A card whose community the member hides fades away, and its
            neighbours glide into the gap. */}
        <AnimatePresence initial={false}>
          {events.map((event, index) => {
            const isPriority = isFirstMonth && index < PRIORITY_CARD_COUNT;
            return (
              <EventCellPresence
                key={`${event.title}-${event.date.toISOString()}`}
                className={itemClassFor(layout)}
              >
                <Reveal
                  as="div"
                  className={revealClassFor(layout)}
                  delay={Math.min(index, REVEAL_MAX_STAGGER) * REVEAL_STEP_MS}
                >
                  {layout === "tickets" ? (
                    <EventTicketCard
                      event={event}
                      now={now}
                      isPriority={isPriority}
                    />
                  ) : (
                    <EventAgendaRow event={event} isPriority={isPriority} />
                  )}
                </Reveal>
              </EventCellPresence>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

/** Loading placeholders in the active layout's own grid or column. */
export function BrowseSkeleton({
  layout,
  count,
}: {
  layout: BrowseLayout;
  count: number;
}) {
  return (
    <div className={listClassFor(layout)} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={itemClassFor(layout)}>
          <EventPosterSkeleton
            variant={layout === "tickets" ? "ticket" : "agenda"}
          />
        </div>
      ))}
    </div>
  );
}
