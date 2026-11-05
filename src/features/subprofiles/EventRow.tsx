import type { CSSProperties } from "react";
import { FiChevronRight, FiMapPin } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EventDateBlock } from "./EventDateBlock";
import { eventDateLabels } from "./eventDateLabels";
import { ItemStateChip } from "./ItemStateChip";
import { GIG_STATE_LABEL } from "./personaSkinRender";
import type { SubprofileItemView } from "./api/subprofiles.adapters";

/** Past this many rows the stamp-in stagger stops growing, so a long list of
 *  upcoming events never keeps the last one waiting. */
const STAGGER_CAP = 8;

/**
 * One event on a Poster (collective) page: the stacked date block, then the
 * title, the venue with a map pin, the doors time, the line-up, any sold out
 * or cancelled chip, and the description. The grid in `persona-skins.css`
 * moves the venue into its own column on a wide page. With `onOpen` the whole
 * row is a button that opens the event sheet; its name reads "Open event",
 * the title, the date written out, the venue and the doors time. Without it
 * (the editor preview) the row is a plain block that still carries the long
 * date for a screen reader. Every row has an `id` so a link elsewhere on the
 * page can jump to it, and a past row carries `data-past="true"`.
 */
export function EventRow({
  item,
  isUpcoming,
  staggerIndex,
  onOpen,
}: {
  item: SubprofileItemView;
  isUpcoming: boolean;
  /** The row's place among the upcoming rows, for the stamp-in stagger. */
  staggerIndex: number;
  onOpen?: (item: SubprofileItemView) => void;
}) {
  const { t, language } = useTranslation();
  const labels = eventDateLabels(item.date, language);
  // A past event's year is its group heading; an upcoming one shows its year
  // only when it falls in another year than this one.
  const shouldShowYear =
    isUpcoming && labels !== null && labels.year !== new Date().getFullYear();
  const venue = item.venue?.trim() || item.subtitle;
  const spokenDate = labels?.longLabel ?? item.date;
  const hasChip = Boolean(item.gigState || item.workState);
  const doors = (item.doors ?? "").trim();
  const doorsLabel = doors ? t("subprofiles:row.doors", { doors }) : "";

  const className = [
    "pp-ev",
    isUpcoming ? "is-upcoming" : "is-past",
    item.gigState === "cancelled" && "is-off",
  ]
    .filter(Boolean)
    .join(" ");
  const rowStyle = {
    "--pp-ev-index": Math.min(staggerIndex, STAGGER_CAP),
  } as CSSProperties;
  const rowId = item.id ? `pp-event-${item.id}` : undefined;
  const pastMark = isUpcoming ? undefined : "true";

  const content = (
    <>
      <EventDateBlock
        labels={labels}
        rawDate={item.date}
        shouldShowYear={shouldShowYear}
      />
      <b className="pp-ev-title">{item.title}</b>
      {spokenDate && <span className="visuallyHidden">{spokenDate}</span>}
      {venue && (
        <span className="pp-ev-venue">
          <FiMapPin aria-hidden />
          <span>{venue}</span>
        </span>
      )}
      {doorsLabel && <span className="pp-ev-doors">{doorsLabel}</span>}
      {item.meta && <span className="pp-ev-meta">{item.meta}</span>}
      {hasChip && (
        <span className="pp-ev-chips">
          <ItemStateChip item={item} />
        </span>
      )}
      {item.description && (
        <span className="pp-ev-desc pp-item-desc">{item.description}</span>
      )}
    </>
  );

  if (onOpen) {
    const accessibleName = [
      `${t("subprofiles:event.row.openPrefix")} ${item.title}`,
      spokenDate,
      venue,
      doorsLabel,
      item.gigState && t(GIG_STATE_LABEL[item.gigState]),
    ]
      .filter(Boolean)
      .join(", ");
    return (
      <button
        type="button"
        id={rowId}
        className={className}
        style={rowStyle}
        data-past={pastMark}
        aria-label={accessibleName}
        onClick={() => onOpen(item)}
      >
        {content}
        <span className="pp-open">
          <FiChevronRight aria-hidden />
        </span>
      </button>
    );
  }

  return (
    <div id={rowId} className={className} style={rowStyle} data-past={pastMark}>
      {content}
    </div>
  );
}
