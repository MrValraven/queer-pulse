import { FiBell, FiX } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  criteriaToFilters,
  useDeleteHousingSavedSearch,
  useHousingSavedSearches,
} from "./api/useHousingSavedSearches";
import type { HousingFilters } from "./housingFilters";
import s from "./HousingPage.module.css";

/**
 * The member's saved housing searches, as re-runnable chips. Clicking one loads
 * its filters back into the board; the bell marks searches with alerts on.
 * Renders nothing when the member has none saved.
 */
export function HousingSavedSearches({
  onApply,
}: {
  onApply: (filters: HousingFilters) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: searches = [] } = useHousingSavedSearches();
  const deleteSavedSearch = useDeleteHousingSavedSearch();

  if (searches.length === 0) return null;

  const handleDelete = (id: string) => {
    deleteSavedSearch.mutate(id, {
      onSuccess: () =>
        showToast(t("economy:housing.savedSearches.removed"), "info"),
    });
  };

  return (
    <div className={s.savedWrap}>
      <div className={s.savedHead}>
        {t("economy:housing.savedSearches.title")}
      </div>
      <div className={s.savedRow}>
        {searches.map((search) => (
          <span key={search.id} className={s.savedChip}>
            <button
              type="button"
              className={s.savedApply}
              onClick={() => onApply(criteriaToFilters(search.criteria))}
            >
              {search.alertsEnabled && (
                <span
                  className={s.savedBell}
                  title={t("economy:housing.savedSearches.alertsOn")}
                >
                  <FiBell aria-hidden />
                </span>
              )}
              {search.name}
            </button>
            <button
              type="button"
              className={s.savedDel}
              onClick={() => handleDelete(search.id)}
              aria-label={t("economy:housing.savedSearches.remove", {
                name: search.name,
              })}
            >
              <FiX aria-hidden />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
