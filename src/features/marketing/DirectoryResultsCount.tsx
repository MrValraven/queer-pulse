import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import s from "./DirectoryPage.module.css";

export interface DirectoryResultsCountProps {
  shown: number;
  total: number;
  /** How many places have actually been fetched so far. Category and
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
  /** Read for the map view's "N of these are on the map" note, and to give
   *  the Online tab its own sentence. */
  view: string;
}

/**
 * The "showing X of Y places" sentence for both Local views and the Online
 * tab. On desktop it rides the filter bar's search row (`countSlot` on
 * `LocalFilterFields`); on phones it opens the results header. A live region,
 * so a filter change is announced as the new count.
 */
export function DirectoryResultsCount({
  shown,
  total,
  loadedCount,
  hasMoreFromServer = false,
  mappableCount,
  loading,
  isError = false,
  view,
}: DirectoryResultsCountProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const rollingCount = (count: number) => (
    <RollingNumber value={fmt.number(count)} numericValue={count} />
  );
  // A client-side filter has narrowed the loaded set AND there are pages the
  // browser has never seen. Count against what's loaded in that case, and name
  // the registry total separately, so the sentence stops implying that `shown`
  // and `total` were measured over the same places. When nothing is narrowing,
  // or everything is loaded, the plain sentence is already true: keep it.
  //
  // The Online tab counts a pool the server already narrowed to businesses
  // that sell online, online-only or a place with a shop (`total` is that
  // pool's size, plus any 18+ shops a member asked for), and pulls every page
  // while it is open, so it gets its own noun and never the loaded-so-far
  // sentence.
  const isOnlineView = view === "online";
  const isCountingLoadedOnly =
    !isOnlineView && hasMoreFromServer && shown < loadedCount;
  return (
    <p className={s.count} aria-live="polite" aria-atomic="true">
      {/* One inline child, so the count keeps its own spacing: the box
          around it is a flex line (it centres the sentence against the
          controls beside it), and a flex container would drop the spaces
          between "Showing", the bold number and "of". */}
      <span>
        {loading ? (
          <>{t("marketing:directory.loading")}</>
        ) : isError ? null : (
          <>
            <Translation
              i18nKey={
                isOnlineView
                  ? "marketing:directory.countOnline"
                  : isCountingLoadedOnly
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
              slots={{
                shown: rollingCount(shown),
                total: rollingCount(total),
                loaded: rollingCount(loadedCount),
              }}
            />
            {isCountingLoadedOnly && (
              <span className={s.countNote}>
                {" · "}
                <Translation
                  i18nKey="marketing:directory.countLoadedTotal"
                  values={{ total }}
                  slots={{ total: rollingCount(total) }}
                />
              </span>
            )}
            {view === "map" && shown !== mappableCount && (
              <span className={s.countNote}>
                {" · "}
                <Translation
                  i18nKey="marketing:directory.onMap"
                  values={{ count: mappableCount }}
                  slots={{ count: rollingCount(mappableCount) }}
                />
              </span>
            )}
          </>
        )}
      </span>
    </p>
  );
}
