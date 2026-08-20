import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMoreFromHost } from "./api/useMoreFromHost";
import { gatheringPath } from "./data";
import styles from "./GatheringRecapPage.module.css";

/**
 * Live-mode re-engagement CTA at the bottom of a gathering's recap: a real
 * query for up to a few other upcoming, published gatherings by the same
 * host (`useMoreFromHost`). When the recapped gathering was part of a
 * recurring series (MSG-10/16 — `seriesId`), the next occurrence is a real
 * `Event` row by the same host, so it already surfaces in this same query;
 * this component just recognizes that case (`event.series?.id ===
 * seriesId`) and reframes the section as "this repeats, here's what's
 * next" instead of the generic "more from this host" copy — a truer
 * description of what the link actually is. Renders nothing when the event
 * has no individual member host (`hostSlug` empty — e.g. an org-hosted
 * event) or that host has nothing else upcoming; an absent section reads
 * better than an empty one.
 */
export function MoreFromHost({
  hostSlug,
  hostName,
  excludeSlug,
  seriesId = null,
}: {
  hostSlug: string;
  hostName: string;
  excludeSlug: string;
  /** The recapped gathering's own series id, or `null` for a standalone
   *  gathering — see the class doc. */
  seriesId?: string | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { data: events } = useMoreFromHost(hostSlug, excludeSlug);

  if (!events || events.length === 0) return null;

  // The next occurrence(s) of the SAME series sort first — a "here's what's
  // next" list should lead with them, not bury them among unrelated
  // gatherings by the same host.
  const sameSeriesCount = seriesId
    ? events.filter((event) => event.series?.id === seriesId).length
    : 0;
  const sortedEvents = sameSeriesCount
    ? [...events].sort((a, b) => {
        const aInSeries = a.series?.id === seriesId ? 0 : 1;
        const bInSeries = b.series?.id === seriesId ? 0 : 1;
        return aInSeries - bInSeries;
      })
    : events;

  return (
    <div className={styles.photos}>
      <div className={styles.sectionEyebrow}>
        {sameSeriesCount > 0
          ? t("gatherings:recap.seriesNextUpEyebrow")
          : t("gatherings:recap.moreFromHostEyebrow", { name: hostName })}
      </div>
      <div className={styles.moreFromHostList}>
        {sortedEvents.map((event) => (
          <div className={styles.nextCard} key={event.slug}>
            <div className={styles.nextTitle}>{event.title}</div>
            <div className={styles.nextDate}>
              {fmt.date(new Date(event.startAt), {
                weekday: "short",
                day: "numeric",
                month: "long",
              })}
              {event.venue ? ` · ${event.venue}` : ""}
            </div>
            <Button to={gatheringPath(event.slug)} className={styles.nextCta}>
              {event.series?.id === seriesId
                ? t("gatherings:recap.seriesNextUpCta")
                : t("gatherings:recap.moreFromHostCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
