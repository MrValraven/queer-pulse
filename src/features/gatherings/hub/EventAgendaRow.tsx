import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ImageSlot, type ImageSlotTint } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { CalendarEvent } from "../data";
import { eventZoneFormat } from "../eventTimezone";
import { sizedCover } from "./coverUrl";
import { EventCoverFallback } from "./EventCoverFallback";
import { EventDateStamp } from "./EventDateStamp";
import {
  EventSpan,
  FormatLine,
  MetaRow,
  PricePill,
  ThemeTags,
} from "./eventCardParts";
import { GoingCount } from "./GoingCount";
import posterStyles from "./EventPosterCard.module.css";
import styles from "./EventAgendaRow.module.css";

/** Retina-aware (~2x) download width for the row's ~240px 16:9 cover. */
const AGENDA_COVER_WIDTH = 480;

/** Theme tags a row shows before folding the rest into a "+N" tag. */
const AGENDA_VISIBLE_THEMES = 2;

export interface EventAgendaRowProps {
  event: CalendarEvent;
  /** Above-the-fold row: eager-loads its cover at high priority. */
  isPriority?: boolean;
}

/** The 16:9 cover. Below 640px it becomes the top of a stacked card, and the
 *  stamp moves onto it as a cream stub; the stylesheet decides which of the
 *  two stamps shows. A gathering with no photo wears the branded
 *  `EventCoverFallback` field. */
function AgendaCover({
  event,
  isPriority,
}: {
  event: CalendarEvent;
  isPriority: boolean;
}) {
  const tint: ImageSlotTint =
    event.orgColor === "var(--accent)" ? "coral" : "plum";
  return (
    <span className={styles.cover}>
      {event.coverImageUrl ? (
        <ImageSlot
          src={sizedCover(event.coverImageUrl, AGENDA_COVER_WIDTH)}
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
      ) : (
        <EventCoverFallback event={event} size="card" />
      )}
      <span className={styles.coverStamp}>
        <EventDateStamp event={event} size="card" surface="onImage" />
      </span>
    </span>
  );
}

/**
 * The alternate Browse layout, read like a printed programme: a date stamp
 * column, a 16:9 cover, then the format, title, where and the whole run of
 * the clock, who is going, and the price beside the host's theme tags. A
 * trailing arrow nudges forward on hover. One `<Link>` per row, named by the
 * event title and its date (the stamps are hidden from assistive tech). Below
 * 640px the row stacks into a card: cover on top carrying the stamp, body
 * below.
 */
export function EventAgendaRow({
  event,
  isPriority = false,
}: EventAgendaRowProps) {
  const { t } = useTranslation();
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
      className={styles.row}
    >
      <span className={styles.stampColumn}>
        <EventDateStamp event={event} size="card" surface="paper" />
      </span>
      <AgendaCover event={event} isPriority={isPriority} />
      <span className={styles.body}>
        <FormatLine event={event} className={`${posterStyles.formatLine}`} />
        <h3 className={styles.title}>{event.title}</h3>
        <span className={styles.meta}>
          <MetaRow event={event}>
            <EventSpan event={event} fmt={formatters} t={t} />
          </MetaRow>
        </span>
        <GoingCount event={event} />
        <span className={styles.tagRow}>
          <PricePill event={event} fmt={formatters} />
          <span className={styles.themeStrip}>
            <ThemeTags event={event} maxVisible={AGENDA_VISIBLE_THEMES} />
          </span>
        </span>
      </span>
      <FiArrowRight className={styles.arrow} aria-hidden />
    </Link>
  );
}
