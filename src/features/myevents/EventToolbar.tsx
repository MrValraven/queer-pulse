import { Select } from "../../shared/components/ui";
import { sx } from "./myEvents.styles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";
import type { FilterKey, SortBy } from "./myEvents.types";

const FILTERS: { key: FilterKey; labelKey: string }[] = [
  { key: "inperson", labelKey: "myevents:toolbar.filter.inperson" },
  { key: "online", labelKey: "myevents:toolbar.filter.online" },
  { key: "free", labelKey: "myevents:toolbar.filter.free" },
  { key: "paid", labelKey: "myevents:toolbar.filter.paid" },
  { key: "month", labelKey: "myevents:toolbar.filter.month" },
];

/** Search field, secondary filter chips, and the sort/density/select controls. */
export function EventToolbar() {
  const { t } = useTranslation();
  const c = useMyEvents();
  return (
    <div className={sx("ev-toolbar")}>
      <div className={sx("ev-search-wrap")}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5 14 14" strokeLinecap="round" />
        </svg>
        <input
          className={sx("ev-search")}
          type="search"
          placeholder={t("myevents:toolbar.searchPlaceholder")}
          value={c.searchTerm}
          onChange={(e) => c.setSearch(e.target.value)}
          aria-label={t("myevents:toolbar.searchAria")}
        />
      </div>

      <div className={sx("ev-filters")}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={sx(`fchip${c.activeFilters[f.key] ? " on" : ""}`)}
            onClick={() => c.toggleFilter(f.key)}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      <div className={sx("ev-controls")}>
        <Select
          size="sm"
          label={t("myevents:toolbar.sortAria")}
          value={c.sortBy}
          onChange={(value) => c.setSort((value ?? "date") as SortBy)}
          options={[
            { value: "date", label: t("myevents:toolbar.sort.date") },
            {
              value: "community",
              label: t("myevents:toolbar.sort.community"),
            },
            { value: "status", label: t("myevents:toolbar.sort.status") },
          ]}
        />
        <button
          type="button"
          className={sx(`ctrl-btn${c.density === "compact" ? " on" : ""}`)}
          onClick={c.toggleDensity}
        >
          <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M2 3h10M2 7h10M2 11h10" />
          </svg>
          <span>
            {c.density === "compact"
              ? t("myevents:toolbar.density.compact")
              : t("myevents:toolbar.density.comfortable")}
          </span>
        </button>
        <button
          type="button"
          className={sx(`ctrl-btn${c.selectMode ? " on" : ""}`)}
          onClick={c.toggleSelectMode}
        >
          <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 7.5 6 10.5 11 4" />
          </svg>
          <span>
            {c.selectMode
              ? t("myevents:toolbar.select.done")
              : t("myevents:toolbar.select.select")}
          </span>
        </button>
        <span className={sx("ctrl-spacer")} />
        <span className={sx("tz-note")}>{t("myevents:toolbar.tzNote")}</span>
      </div>
    </div>
  );
}
