import { FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { Button, Collapse } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CreatedEventBatchEventDTO } from "../api/eventBatch.api";
import { gatheringPath } from "../gatheringPaths";
import { formatCreatedEventWhen } from "./addMonthDates";
import styles from "./AddMonthPublish.module.css";

/** One answer row the list can show: a slug to link, a title to read and a
 *  start the clock can format. The publish answer has no runtime validator,
 *  so a row missing any of these is left out of the list. */
function isListableEvent(event: unknown): event is CreatedEventBatchEventDTO {
  if (typeof event !== "object" || event === null) return false;
  const candidate = event as Partial<CreatedEventBatchEventDTO>;
  return (
    typeof candidate.slug === "string" &&
    candidate.slug !== "" &&
    typeof candidate.title === "string" &&
    typeof candidate.startAt === "string" &&
    !Number.isNaN(Date.parse(candidate.startAt))
  );
}

/** DOM id of the results heading, where focus lands after a publish. */
export const ADD_MONTH_RESULTS_HEADING_ID = "add-month-results-heading";

interface AddMonthResultsProps {
  /** The new events in date order. A missing or empty list still reads as a
   *  published month, with a pointer to the host's events. */
  events: readonly CreatedEventBatchEventDTO[] | null | undefined;
  /** The starting event's zone, so each start reads on its own wall clock. */
  timezone: string;
  onAddAnother: () => void;
}

/**
 * The success panel after a month publishes: how many events went up, one
 * line per event with its date and a link to it, then a way to the host's
 * events and a way to start another month.
 */
export function AddMonthResults({
  events,
  timezone,
  onAddAnother,
}: AddMonthResultsProps) {
  const { t, language } = useTranslation();
  const publishedCount = Array.isArray(events) ? events.length : 0;
  const hasPublishedCount = publishedCount > 0;
  // The heading counts every row the answer sent; the list shows the rows it
  // can link and date.
  const listedEvents = Array.isArray(events)
    ? events.filter(isListableEvent)
    : [];
  const hasListedEvents = listedEvents.length > 0;

  return (
    <div className={styles.results}>
      <span className={styles.resultsIcon} aria-hidden>
        <FiCheck />
      </span>
      <h2
        id={ADD_MONTH_RESULTS_HEADING_ID}
        className={styles.resultsTitle}
        tabIndex={-1}
      >
        {hasPublishedCount ? (
          <Translation
            i18nKey="gatherings:addMonth.results.title"
            values={{ count: publishedCount }}
            components={{ em: <em /> }}
          />
        ) : (
          <Translation
            i18nKey="gatherings:addMonth.results.titleUnlisted"
            components={{ em: <em /> }}
          />
        )}
      </h2>
      <p className={styles.lede}>
        {hasPublishedCount
          ? t("gatherings:addMonth.results.lede")
          : t("gatherings:addMonth.results.unlistedLede")}
      </p>
      <Collapse isOpen={hasListedEvents}>
        <ol className={styles.eventList}>
          {listedEvents.map((event) => (
            <li key={event.slug} className={styles.eventItem}>
              <span className={styles.eventWhen}>
                {formatCreatedEventWhen(event.startAt, timezone, language)}
              </span>
              <Link to={gatheringPath(event.slug)} className={styles.eventLink}>
                {event.title}
              </Link>
            </li>
          ))}
        </ol>
      </Collapse>
      <div className={styles.actions}>
        <Button variant="ghost-dark" to={routes.myEvents}>
          {t("gatherings:addMonth.results.goToEvents")}
        </Button>
        <Button variant="ghost-dark" onClick={onAddAnother}>
          {t("gatherings:addMonth.results.addAnother")}
        </Button>
      </div>
    </div>
  );
}
