import { useMemo } from "react";
import { FilterChips } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { adminToolbarClasses } from "../ui";
import type { AdminRoadmapItemDTO } from "../api/roadmapAdmin.types";
import { SAVED_VIEWS } from "./roadmapChrome.data";
import { SAVED_VIEW_PREDICATES } from "./state/roadmapFiltersTypes";
import { useRoadmapFilters } from "./state/roadmapFiltersHook";
import styles from "./RoadmapChrome.module.css";
import phone from "../adminPhoneActions.module.css";

/**
 * The 7 saved-view chips (`roadmap.savedViews.*`) on the shared
 * `FilterChips`, shown under the Board and Timeline toolbar. Reads and writes
 * `useRoadmapFilters().savedView` directly: clicking the active chip clears it
 * (see `setSavedView`'s own doc). Only "late" carries a live count, computed
 * straight off `SAVED_VIEW_PREDICATES.late` so it always matches what the chip
 * filters to; the other 6 are read by scanning the filtered list once applied.
 */
export function SavedViewChips({ items }: { items: AdminRoadmapItemDTO[] }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { filters, setSavedView } = useRoadmapFilters();

  const lateCount = useMemo(() => {
    const isLate = SAVED_VIEW_PREDICATES.late;
    return isLate ? items.filter(isLate).length : 0;
  }, [items]);

  return (
    <FilterChips
      className={`${adminToolbarClasses.chips} ${styles.savedViews} ${phone.scrollRow}`}
      label={t("admin:roadmap.savedViews.label")}
      value={filters.savedView ?? ""}
      onChange={setSavedView}
      options={SAVED_VIEWS.map((view) =>
        view.id === "late"
          ? {
              value: view.id,
              label: t(view.labelKey),
              count: lateCount,
              // Stays clickable at zero: the chip toggles a view and a
              // count of none is an answer worth showing.
              isUnavailable: false,
              ariaLabel: `${t(view.labelKey)}, ${format.number(lateCount)}`,
            }
          : { value: view.id, label: t(view.labelKey) },
      )}
    />
  );
}
