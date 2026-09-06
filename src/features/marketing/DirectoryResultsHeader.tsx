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
  loadedCount,
  hasMoreFromServer = false,
  mappableCount,
  loading,
  isError = false,
  view,
  nearMeSlot,
  activeFiltersSlot,
}: {
  shown: number;
  total: number;
  /** How many places have actually been fetched so far. Category, vibe and
   *  "open now" are filtered client-side over exactly this set (see
   *  `useDirectoryFilterResults`), so while pages remain unfetched `shown` and
   *  `total` count two different populations and the sentence has to say so. */
  loadedCount: number;
  /** True while the backend still has pages beyond `loadedCount`. */
  hasMoreFromServer?: boolean;
  mappableCount: number;
  loading: boolean;
  /** True when the directory read failed (DES-25). The count is withheld: a
   *  failed read knows no totals, and "Showing 0 of 0 places" would contradict
   *  the error panel below it. */
  isError?: boolean;
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
  // A client-side filter has narrowed the loaded set AND there are pages the
  // browser has never seen. Count against what's loaded in that case, and name
  // the registry total separately, so the sentence stops implying that `shown`
  // and `total` were measured over the same places. When nothing is narrowing,
  // or everything is loaded, the plain sentence is already true: keep it.
  const isCountingLoadedOnly = hasMoreFromServer && shown < loadedCount;
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
              ) : isError ? null : (
                <>
                  <Translation
                    i18nKey={
                      isCountingLoadedOnly
                        ? "marketing:directory.countLoaded"
                        : "marketing:directory.count"
                    }
                    components={{ b: <b /> }}
                    // `count` is what drives CLDR selection in `resolveEntry`,
                    // and it has to be the number the plural NOUN agrees with.
                    // In both sentences that noun ("places") sits beside the
                    // size of the pool, never beside `shown`: a filtered
                    // "Showing 1 of 24 places" is correct English. So `count`
                    // follows whichever pool this branch is counting against.
                    // Without this the plain sentence read "Showing 1 of 1
                    // places" on any search narrow enough to return one place.
                    values={{
                      shown,
                      total,
                      loaded: loadedCount,
                      count: isCountingLoadedOnly ? loadedCount : total,
                    }}
                  />
                  {isCountingLoadedOnly && (
                    <span className={s.countNote}>
                      {" · "}
                      {t("marketing:directory.countLoadedTotal", { total })}
                    </span>
                  )}
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
