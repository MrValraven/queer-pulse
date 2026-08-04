import { useMemo } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminRoadmapItemDTO } from "../api/roadmapAdmin.types";
import { SAVED_VIEWS } from "./roadmapChrome.data";
import { SAVED_VIEW_PREDICATES, useRoadmapFilters } from "./state/useRoadmapFilters";
import styles from "./RoadmapChrome.module.css";

/**
 * The 7 saved-view filter chips (`roadmap.savedViews.*`), shown above the
 * Board/Timeline toolbar. Reads/writes `useRoadmapFilters().savedView`
 * directly — clicking the already-active chip clears it (a toggle, not a
 * one-way radio group; see `setSavedView`'s own doc). Only "late" carries a
 * live badge count, computed straight off `SAVED_VIEW_PREDICATES.late` so it
 * can never drift from what the chip itself would filter to if clicked —
 * the other 6 are read by scanning the filtered list once applied.
 */
export function SavedViewChips({ items }: { items: AdminRoadmapItemDTO[] }) {
  const { t } = useTranslation();
  const { filters, setSavedView } = useRoadmapFilters();

  const lateCount = useMemo(() => {
    const isLate = SAVED_VIEW_PREDICATES.late;
    return isLate ? items.filter(isLate).length : 0;
  }, [items]);

  return (
    <div
      className={styles.chipsRow}
      role="group"
      aria-label={t("admin:roadmap.savedViews.label")}
    >
      {SAVED_VIEWS.map((view) => {
        const active = filters.savedView === view.id;
        return (
          <button
            key={view.id}
            type="button"
            className={[styles.chip, active && styles.chipOn]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={active}
            onClick={() => setSavedView(view.id)}
          >
            {t(view.labelKey)}
            {view.id === "late" && (
              <span className={styles.chipCount}>{lateCount}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
