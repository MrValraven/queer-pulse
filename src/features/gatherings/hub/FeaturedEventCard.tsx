import { Button, Eyebrow, ImageSlot } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { CalendarEvent } from "../data";
import { eventZoneFormat } from "../eventTimezone";
import styles from "./FeaturedEventCard.module.css";

/**
 * Compact "Next up" card — the one genuinely useful thing the old full-bleed
 * hero did: surface the single best upcoming event. Sits at the top of the
 * Discover panel; renders nothing when there's no lead (so there's never an
 * empty hero taking up space).
 */
export function FeaturedEventCard({ lead }: { lead: CalendarEvent | null }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  if (!lead) return null;
  // The lead reads on the event's own clock, labelled when it isn't the
  // reader's own (see `eventZoneFormat`).
  const zone = eventZoneFormat(lead.timezone, lead.date);

  return (
    <div className="wrap">
      <article className={styles.card}>
        <div className={styles.thumb}>
          <ImageSlot
            src={lead.coverImageUrl}
            alt=""
            placeholder={lead.title}
            width="100%"
            height="100%"
            radius={0}
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
        <div className={styles.body}>
          <Eyebrow>{t("gatherings:hub.featured.eyebrow")}</Eyebrow>
          <h2 className={styles.title}>{lead.title}</h2>
          <p className={styles.meta}>
            {fmt.date(lead.date, {
              weekday: "long",
              day: "numeric",
              month: "long",
              ...zone.dateOptions,
            })}
            {" · "}
            {fmt.time(lead.date, zone.timeOptions)}
            {" · "}
            {lead.hood}
          </p>
          <Button to={lead.to}>{t("gatherings:hub.hero.rsvp")}</Button>
        </div>
      </article>
    </div>
  );
}
