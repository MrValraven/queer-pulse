import type { ReactNode } from "react";
import { FiList, FiMap, FiX } from "react-icons/fi";
import { SegmentedControl } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import type { LocalSort } from "./localPlaces";
import s from "./DirectoryPage.module.css";

export interface ActiveFilter {
  /** Stable react key. */
  key: string;
  /** Chip label (category / vibe name / quoted query). */
  label: ReactNode;
  /** Remove just this filter. */
  onRemove: () => void;
}

const SORT_OPTIONS: LocalSort[] = ["default", "name", "hood"];

/**
 * Results header shared by both Local views: the "showing X of Y places" count
 * on the left, and the sort + List/Map view switcher on the right. A second row
 * of removable chips appears whenever any filter is active, with a Clear all.
 */
export function DirectoryResultsHeader({
  shown,
  total,
  mappableCount,
  loading,
  view,
  onViewChange,
  sort,
  onSortChange,
  activeFilters,
  onClearFilters,
}: {
  shown: number;
  total: number;
  mappableCount: number;
  loading: boolean;
  view: string;
  onViewChange: (next: string) => void;
  sort: LocalSort;
  onSortChange: (next: string) => void;
  activeFilters: ActiveFilter[];
  onClearFilters: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={s.resultsHeader}>
      <div className="wrap">
        <div className={s.resultsRow}>
          <p className={s.count} aria-live="polite">
            {loading ? (
              <>{t("marketing:directory.loading")}</>
            ) : (
              <>
                <Translation
                  i18nKey="marketing:directory.count"
                  components={{ b: <b /> }}
                  values={{ shown, total }}
                />
                {view === "map" && shown !== mappableCount && (
                  <span className={s.countNote}>
                    {" · "}
                    {t("marketing:directory.onMap", { count: mappableCount })}
                  </span>
                )}
              </>
            )}
          </p>

          <div className={s.resultsControls}>
            <label className={s.sort}>
              <span className={s.sortLabel}>
                {t("marketing:directory.sort.label")}
              </span>
              <select
                className={s.sortSelect}
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(`marketing:directory.sort.${option}`)}
                  </option>
                ))}
              </select>
            </label>

            <SegmentedControl
              label={t("marketing:local.view.toggleAria")}
              options={[
                {
                  value: "list",
                  label: t("marketing:local.view.list"),
                  icon: <FiList />,
                },
                {
                  value: "map",
                  label: t("marketing:local.view.map"),
                  icon: <FiMap />,
                },
              ]}
              value={view}
              onChange={onViewChange}
            />
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className={s.activeRow}>
            <span className={s.activeLabel}>
              {t("marketing:directory.activeFilters")}
            </span>
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={s.activeChip}
                onClick={filter.onRemove}
              >
                {filter.label}
                <FiX aria-hidden />
                <span className={s.srOnly}>
                  {t("marketing:directory.removeFilter")}
                </span>
              </button>
            ))}
            <button
              type="button"
              className={s.clearAll}
              onClick={onClearFilters}
            >
              {t("marketing:directory.clearAll")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
