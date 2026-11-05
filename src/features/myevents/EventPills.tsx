import { useId } from "react";
import { RefineGroup } from "../../shared/components/ui";
import { sx } from "./myEvents.styles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";
import { DEFAULT_PILL, MY_EVENTS_PILLS } from "./myEvents.filters";

/**
 * The primary bucket pills with live counts, the first band of the agenda's
 * "Refine" drawer.
 *
 * Exactly one is on at a time, so this is a radio-style choice rather than a
 * set of filters. It still lives in the drawer, because the six pills and the
 * five filter chips standing open cost two rows above the first event. Which
 * bucket is showing survives the drawer being shut: anything other than the
 * default reads as a chip on the active-filter row.
 *
 * Each pill carries what picking it would list with the search and chips as
 * they stand. No number is drawn until the whole list is in, and a pill that
 * would list nothing is held off, unless it is the one showing (so the member
 * can leave it) or the default bucket every "clear" returns to.
 */
export function EventPills() {
  const { t } = useTranslation();
  const { pill, setPill, pillCounts } = useMyEvents();
  const labelId = useId();

  return (
    <RefineGroup
      label={t("myevents:pills.groupLabel")}
      labelId={labelId}
      role="group"
      aria-labelledby={labelId}
    >
      <div className={sx("pill-row")}>
        {MY_EVENTS_PILLS.map((entry) => {
          const count = pillCounts?.[entry.key];
          const isActive = pill === entry.key;
          const isDisabled =
            count === 0 && !isActive && entry.key !== DEFAULT_PILL;
          return (
            <button
              key={entry.key}
              type="button"
              className={sx(`pill${isActive ? " active" : ""}`)}
              aria-pressed={isActive}
              disabled={isDisabled}
              onClick={() => setPill(entry.key)}
            >
              {t(entry.labelKey)}{" "}
              {count !== undefined && <span className={sx("pc")}>{count}</span>}
            </button>
          );
        })}
      </div>
    </RefineGroup>
  );
}
