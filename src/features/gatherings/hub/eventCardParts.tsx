import type { ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Tag } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { CalendarEvent } from "../data";
import { formatLabel } from "../gatheringCatalog";
import { MAX_GATHERING_THEMES, THEME_LABEL_KEYS } from "../gatheringExtras";
import { eventZoneFormat } from "../eventTimezone";
import { gatheringWhen } from "../gatheringSchedule";
import { timeBucketOf, timeBucketLabelKey } from "./pickHighlights";
import styles from "./EventPosterCard.module.css";

/**
 * The small parts every event card in the hub is built from: `EventPosterCard`,
 * `EventTicketCard` and `EventAgendaRow` all compose these, so a price, a kind
 * badge or a start time reads the same on every card. Their styles stay in
 * `EventPosterCard.module.css`.
 */

/** Small top-left pill naming the event's time bucket ("Happening now",
 *  "Tonight", "This weekend" …). It reads the whole span, so a gathering that
 *  is under way says exactly that. `className` lets a card place it somewhere
 *  else; the poster cards keep the default. */
export function WhenRibbon({
  event,
  now,
  className = styles.ribbon,
}: {
  event: CalendarEvent;
  now: Date;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <span className={className}>
      {t(timeBucketLabelKey(timeBucketOf(event, now)))}
    </span>
  );
}

/** The event's start time on ITS clock, carrying the short zone name whenever
 *  that clock differs from the reader's own. */
export function EventTime({
  event,
  fmt,
}: {
  event: CalendarEvent;
  fmt: Formatters;
}) {
  const zone = eventZoneFormat(event.timezone, event.date);
  return <>{fmt.time(event.date, zone.timeOptions)}</>;
}

/**
 * The event's whole run on ITS clock: "23:00 – 04:00 (next day)".
 *
 * Carried by the two full-width posters only. They are the two that wear the
 * "Happening now" ribbon, and a bare start time under that ribbon leaves the
 * reader with no way to tell when the party finishes. The `DateChip` above
 * prints a date range only from two days apart, so an overnight party said
 * nothing at all about running to 04:00.
 *
 * A gathering with no stated end renders exactly what `EventTime` renders,
 * since `gatheringWhen` prints a lone start time for one.
 */
export function EventSpan({
  event,
  fmt,
  t,
}: {
  event: CalendarEvent;
  fmt: Formatters;
  t: TFunction;
}) {
  const zone = eventZoneFormat(event.timezone, event.date);
  const when = gatheringWhen(
    event.date,
    event.endAt,
    fmt,
    t,
    zone.dateOptions,
    zone.timeOptions,
  );
  return (
    <>
      {when.timeText}
      {when.nextDayNote ? ` ${when.nextDayNote}` : ""}
    </>
  );
}

/** Event-vs-gathering badge. `onScrim` swaps to the opaque, always-legible
 *  variant used when the chip sits directly over cover artwork. */
export function KindTag({
  kind,
  onScrim,
}: {
  kind: CalendarEvent["kind"];
  onScrim?: boolean;
}) {
  const { t } = useTranslation();
  const isEvent = kind === "event";
  const className = isEvent
    ? onScrim
      ? styles.kindEventScrim
      : styles.kindEvent
    : onScrim
      ? styles.kindGatheringScrim
      : styles.kindGathering;
  return (
    <Tag className={className}>
      {t(
        isEvent
          ? "gatherings:events.kindEvent"
          : "gatherings:events.kindGathering",
      )}
    </Tag>
  );
}

/** Sliding-scale / fixed price pill, only rendered for ticketed events. */
export function PricePill({
  event,
  fmt,
  onScrim,
}: {
  event: CalendarEvent;
  fmt: Formatters;
  onScrim?: boolean;
}) {
  const { t } = useTranslation();
  // LOC-18: the host's own words about the door, when they wrote any.
  // DISPLAY ONLY: nothing on this card takes a payment, and the pill is a
  // plain label for exactly that reason. A gathering the server marked free
  // wears the "Free" chip.
  const cost = event.cost?.trim();
  if (cost) {
    return (
      <span className={onScrim ? styles.pricePillScrim : styles.pricePill}>
        {cost}
      </span>
    );
  }
  if (event.isFree) {
    return (
      <span className={onScrim ? styles.pricePillScrim : styles.pricePill}>
        {t("gatherings:events.freeTag")}
      </span>
    );
  }
  if (!event.ticketed) return null;
  const label =
    event.priceMin === undefined
      ? t("gatherings:events.ticketedTag")
      : event.priceMax !== undefined
        ? t("gatherings:events.priceRange", {
            min: fmt.currency(event.priceMin),
            max: fmt.currency(event.priceMax),
          })
        : t("gatherings:events.priceSingle", {
            price: fmt.currency(event.priceMin),
          });
  return (
    <span className={onScrim ? styles.pricePillScrim : styles.pricePill}>
      {label}
    </span>
  );
}

/** "See it" hover/focus affordance for `featured`/`list`. Purely decorative,
 *  since the whole card is already the single accessible link, so it's `aria-hidden`
 *  and inert (`pointer-events: none` in CSS). */
export function CtaPill({ className }: { className: string }) {
  const { t } = useTranslation();
  return (
    <span className={className} aria-hidden="true">
      {t("gatherings:hub.card.cta")} <FiArrowRight aria-hidden />
    </span>
  );
}

/** Neighbourhood, then whatever reading of the clock the variant asked for.
 *  The schedule arrives as `children` so each variant composes its own, which
 *  keeps the width-constrained `list` card on a bare start time while the
 *  full-width posters carry the whole run. */
export function MetaRow({
  event,
  children,
}: {
  event: CalendarEvent;
  children: ReactNode;
}) {
  return (
    <span className={styles.meta}>
      <span className={styles.metaItem}>{event.hood}</span>
      <span className={styles.dot} aria-hidden />
      <span className={styles.metaItem}>{children}</span>
    </span>
  );
}

/** The gathering's own format, in a small line above the title. Skipped
 *  entirely when the host never set one: a card should not announce that a
 *  gathering is a "Gathering". */
export function FormatLine({
  event,
  className,
}: {
  event: CalendarEvent;
  className: string;
}) {
  const { t } = useTranslation();
  if (!event.eventType?.trim()) return null;
  return <span className={className}>{formatLabel(t, event.eventType)}</span>;
}

/** "Run by <business>", under the title. Plain text: the whole card is one
 *  link already, and a link inside a link is invalid, so the business's own
 *  link lives on the gathering page. */
export function RunByLine({
  event,
  className,
}: {
  event: Pick<CalendarEvent, "runByName">;
  className?: string | undefined;
}) {
  const { t } = useTranslation();
  const name = event.runByName?.trim();
  if (!name) return null;
  return (
    <span className={className}>
      {t("gatherings:hub.card.runBy", { name })}
    </span>
  );
}

/** Up to three theme tags the host pinned to the gathering (Create Gathering
 *  v2). Labels only: the whole card is one link named by its title, so these
 *  are a glance at what kind of evening it is. `onScrim` takes the cream
 *  register the poster overlay uses. `maxVisible` caps how many tags show
 *  for the width-constrained cards; the rest fold into one "+N" tag. Left
 *  unset, every pinned theme shows. */
export function ThemeTags({
  event,
  onScrim,
  maxVisible,
}: {
  event: CalendarEvent;
  onScrim?: boolean;
  maxVisible?: number;
}) {
  const { t } = useTranslation();
  const themes = (event.themes ?? []).slice(0, MAX_GATHERING_THEMES);
  if (themes.length === 0) return null;
  const visibleThemes =
    maxVisible === undefined ? themes : themes.slice(0, maxVisible);
  const hiddenThemeCount = themes.length - visibleThemes.length;
  const tagClassName = onScrim ? styles.themeTagScrim : styles.themeTag;
  return (
    <span className={styles.themeRow}>
      {visibleThemes.map((theme) => (
        <Tag key={theme} className={tagClassName}>
          {t(THEME_LABEL_KEYS[theme])}
        </Tag>
      ))}
      {hiddenThemeCount > 0 && (
        <Tag className={tagClassName}>
          {t("gatherings:hub.card.moreThemes", { count: hiddenThemeCount })}
        </Tag>
      )}
    </span>
  );
}
