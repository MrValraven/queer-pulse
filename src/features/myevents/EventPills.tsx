import { useId } from "react";
import { RefineGroup } from "../../shared/components/ui";
import { sx } from "./myEvents.styles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";
import { MY_EVENTS_PILLS } from "./myEvents.filters";

/**
 * The primary bucket pills with live counts, the first band of the agenda's
 * "Refine" drawer.
 *
 * Exactly one is on at a time, so this is a radio-style choice rather than a
 * set of filters. It still lives in the drawer, because the six pills and the
 * five filter chips standing open cost two rows above the first event. Which
 * bucket is showing survives the drawer being shut: anything other than the
 * default reads as a chip on the active-filter row.
 */
export function EventPills() {
  const { t } = useTranslation();
  const { pill, setPill, counts } = useMyEvents();
  const labelId = useId();

  return (
    <RefineGroup
      label={t("myevents:pills.groupLabel")}
      labelId={labelId}
      role="group"
      aria-labelledby={labelId}
    >
      <div className={sx("pill-row")}>
        {MY_EVENTS_PILLS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            className={sx(`pill${pill === entry.key ? " active" : ""}`)}
            aria-pressed={pill === entry.key}
            onClick={() => setPill(entry.key)}
          >
            {t(entry.labelKey)}{" "}
            <span className={sx("pc")}>{counts[entry.key] || ""}</span>
          </button>
        ))}
      </div>
    </RefineGroup>
  );
}
