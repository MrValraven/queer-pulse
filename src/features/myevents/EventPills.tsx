import { sx } from "./myEvents.styles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";
import type { Pill } from "./myEvents.types";

const PILLS: { key: Pill; labelKey: string }[] = [
  { key: "upcoming", labelKey: "myevents:pills.upcoming" },
  { key: "going", labelKey: "myevents:pills.going" },
  { key: "hosting", labelKey: "myevents:pills.hosting" },
  { key: "waitlisted", labelKey: "myevents:pills.waitlisted" },
  { key: "past", labelKey: "myevents:pills.past" },
  { key: "saved", labelKey: "myevents:pills.saved" },
];

/** The primary bucket pills with live counts. */
export function EventPills() {
  const { t } = useTranslation();
  const { pill, setPill, counts } = useMyEvents();
  return (
    <div className={sx("pill-row")}>
      {PILLS.map((p) => (
        <button
          key={p.key}
          type="button"
          className={sx(`pill${pill === p.key ? " active" : ""}`)}
          onClick={() => setPill(p.key)}
        >
          {t(p.labelKey)}{" "}
          <span className={sx("pc")}>{counts[p.key] || ""}</span>
        </button>
      ))}
    </div>
  );
}
