import type { ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import s from "./DirectoryPage.module.css";

/**
 * Results header shared by both Local views: the "showing X of Y places" count
 * on the left, and on phones the "use my location" control on the right, with
 * the active-filter chips below. Sort, the List/Map switcher and (on desktop)
 * those chips live up in the filter bar instead, so every control that shapes
 * the results sits together and this header only reports what they found.
 */
export function DirectoryResultsHeader({
  shown,
  total,
  mappableCount,
  loading,
  view,
  nearMeSlot,
  activeFiltersSlot,
}: {
  shown: number;
  total: number;
  mappableCount: number;
  loading: boolean;
  /** Only read for the map view's "N of these are on the map" note. */
  view: string;
  /** The "use my location" control, passed in rather than built here so this
   *  header stays presentational and the member's position never travels
   *  further than the one component that owns it. Filled on phones only — on
   *  desktop the control rides the search row instead (see `DirectoryPage`). */
  nearMeSlot?: ReactNode;
  /** The active-filter chips. Filled on phones only: on desktop they ride the
   *  filter bar, under the search row that sets them (see `DirectoryPage`). */
  activeFiltersSlot?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={s.resultsHeader}>
      <div className="wrap">
        <div className={s.resultsRow}>
          <p className={s.count} aria-live="polite">
            {/* One inline child, so the count keeps its own spacing: the box
                around it is a flex line (it centres the sentence against the
                controls opposite), and a flex container would drop the spaces
                between "Showing", the bold number and "of". */}
            <span>
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
            </span>
          </p>

          {nearMeSlot && <div className={s.resultsControls}>{nearMeSlot}</div>}
        </div>

        {activeFiltersSlot}
      </div>
    </div>
  );
}
