import { useTranslation } from "../../shared/i18n/useTranslation";
import { groupPastEventsByYear, splitEvents } from "./eventDates";
import { EventRow } from "./EventRow";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import type { SubprofileSection } from "./api/subprofiles.api";

/** A row key that survives reordering: the item's id, or its title and date
 *  for an unsaved item in the editor preview. */
function eventKey(item: SubprofileItemView, index: number): string {
  return item.id || `${item.title}::${item.date}::${index}`;
}

/**
 * A Poster page's events (or nights) as a timeline: what is coming up first,
 * soonest at the top, then the archive under "Past events", newest first and
 * grouped under year headings. Events with no usable date close the archive
 * without a year. The section's own h2 heads the upcoming block, so it needs
 * no label of its own.
 */
export function EventsTimeline({
  items,
  section,
  interactive,
  onOpenEvent,
}: {
  items: SubprofileItemView[];
  section: SubprofileSection;
  interactive: boolean;
  /** Opens the event sheet on a clicked row. Only wired when `interactive`. */
  onOpenEvent?: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();
  const { upcoming, past } = splitEvents(items);
  const pastGroups = groupPastEventsByYear(past);
  const onOpen = interactive ? onOpenEvent : undefined;
  const pastLabelKey =
    section === "nights"
      ? "subprofiles:section.nightsPast"
      : "subprofiles:section.eventsPast";

  return (
    <div className="pp-events">
      {upcoming.length > 0 && (
        <div className="pp-ev-list is-upcoming">
          {upcoming.map((item, index) => (
            <EventRow
              key={eventKey(item, index)}
              item={item}
              isUpcoming
              staggerIndex={index}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
      {past.length > 0 && (
        <div className="pp-ev-past">
          <h3 className="pp-ev-past-label">{t(pastLabelKey)}</h3>
          {pastGroups.map((group) => (
            <div
              className={`pp-ev-year-group${group.year === null ? " is-undated" : ""}`}
              key={group.year ?? "undated"}
            >
              {/* An h4: each year sits inside the "Past events" h3. */}
              {group.year !== null && (
                <h4 className="pp-ev-year">{group.year}</h4>
              )}
              <div className="pp-ev-list">
                {group.items.map((item, index) => (
                  <EventRow
                    key={eventKey(item, index)}
                    item={item}
                    isUpcoming={false}
                    staggerIndex={index}
                    onOpen={onOpen}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
